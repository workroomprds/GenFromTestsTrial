#!/bin/bash

# configuration
readonly MAX_ATTEMPTS=3
readonly TEST_FILE_PREFIX="./test/jest/"
readonly SOURCE_FILE_PREFIX="./src/js/"
readonly RULES_FILE="./rules.md"
readonly LLM_TEMPLATE="rewrite_js_to_pass_tests_no_thinking"
readonly LLM_MODEL="claude-3.5-sonnet" ##qwen3
#readonly LLM_MODEL="claude-3.5-sonnet" ## comment out to use default, or if template contains model.
#readonly LLM_MODEL="4o-mini" ## comment out to use default, or if template contains model.
#readonly STREAMING="--no-stream"  ## comment out to stream

# human-readable values
readonly TRUE=0
readonly FALSE=1
readonly EXIT_SUCCESS=0
readonly EXIT_NO_PARAMETER=1
readonly EXIT_TEST_FILE_NOT_FOUND=2
readonly EXIT_TEST_FILE_SYNTAX_ERROR=3
readonly EXIT_TESTS_FAILED_AFTER_ITERATIONS=4
readonly ALL_TESTS_PASSED_FIRST_TIME=5

numberOfArgs=$#
firstParameter=$1

## FUNCTIONS
# Check if a parameter is provided
checkParameters() {
        if [ $numberOfArgs -eq 0 ]; then
                echo "Error: No parameter provided."
                exit $EXIT_NO_PARAMETER
        fi
}

# Check test file existence and syntax
checkTestFile() {
        #check if the test file exists
         if [ ! -f "$test_file" ]; then
                echo "Error: Test file $test_file does not exist."
                exit $EXIT_TEST_FILE_NOT_FOUND
        fi
        
        # check syntax of inbound test file
        syntax_output=$(npx eslint --config eslint-configs/jest-check.mjs "$test_file" 2>&1)
        exit_code=$?
        if [ -n "$exit_code" ] && [ "$exit_code" -ne 0 ]; then
                echo "Syntax error detected in $test_file: not sending for generation"
                echo "$syntax_output"
                exit $EXIT_TEST_FILE_SYNTAX_ERROR
        fi
}

# make an empty one if neccessary
fixSourceFile() {
        if [ ! -f "$source_file" ]; then
                echo "Source file $source_file does not exist. Creating an empty file."
                touch "$source_file"
        fi
}

# no point in TDDing if the tests pass...
exitIfTestsPassFirstTime() {
        if [ $test_exit_code -eq 0 ]; then
                echo "Tests already pass. No code generated. Exiting."
                exit $ALL_TESTS_PASSED_FIRST_TIME
        fi
}

# run tests / checks and handle results
checkCode() {
        echo "Running tests (checks) from $test_file"
        test_results="$(NODE_OPTIONS='--experimental-vm-modules --import=./jest.env.mjs' npx jest --testPathPattern=\"$test_file\" --collectCoverageFrom=\"$source_file\" --coverage --coverageReporters="json-summary" --coverageDirectory="./coverage" 2>&1)"
        test_exit_code=$?
        echo "Jest exited with: $test_exit_code"
        if [ $test_exit_code -eq 0 ]; then
                exit_triumphantly
        else
                echo "Tests failed. Test output follows<<<<<<<<<<"
                echo "$test_results"
                echo ">>>>>>>>>>>>>"
                return 1
        fi
}

# pass to AI via LLM tool
replaceSourceWithGeneratedCode() { ## parameter 1 is new_conversation
        # code_contents and test_results may be different each time
        code_contents="$(< "$source_file")"
        if [ "$new_conversation" -eq $TRUE ]; then
            continue_flag="" #intentionally not set
            echo "Starting new conversation"
            new_conversation=$FALSE
        else
            continue_flag="--continue"
            echo "Continuing conversation"
        fi
        
        echo "Attempting to generate new code with LLM"
        llm -t $LLM_TEMPLATE \
                $llmModelParameter \
                -p code "$code_contents" \
                -p tests "$test_contents" \
                -p test_results "$test_results" \
                -p rules "$the_rules" \
                -p input "" \
                $continue_flag \
                $STREAMING \
                "" \
                > "$source_file"
        llm_exit_code=$?

        echo "Trimming"
# Remove thinking blocks and code fences from generated file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS (BSD sed)
    sed -i '' '/<think>/,/<\/think>/d' "$source_file"
    sed -i '' '/<thinking>/,/<\/thinking>/d' "$source_file"
    sed -i '' '/^```/d' "$source_file"
else
    # Linux/other (GNU sed)
    sed -i '/<think>/,/<\/think>/d' "$source_file"
    sed -i '/<thinking>/,/<\/thinking>/d' "$source_file"
    sed -i '/^```/d' "$source_file"
fi

        if [ $llm_exit_code -eq 0 ]; then
                echo "LLM generated a new $source_file. Passing over to tests in $test_file"
                return 0
        else
                echo "LLM failed to generate new code with error code $llm_exit_code – consider restoring source from change control"
                return 1
        fi
}

# commit changes if new code passes tests
commit_changes() {
        echo "Attempting to commit changes" 
        commitMessage="AI generated changes to $source_file to pass tests in $test_file"

        git add "$source_file" "$test_file" && git commit -m "$commitMessage"
        gitStatus=$?
        if [ "$gitStatus" -eq $TRUE ] ; then
                echo "Your tests, and the generated source, have been committed to the repository"
        else
                echo "While the generated code passes the tests, git stage or commit failed with error: $gitStatus . Perhaps the files match those already commited, so «git add» did nothing?"
        fi
}

# message on success
exit_triumphantly() {
                echo "Code generated and checked" 
                # Extract line coverage percentage from JSON
                if [ -f "./coverage/coverage-summary.json" ]; then
                coverage_percentage=$(node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync('./coverage/coverage-summary.json')); console.log(data.total.lines.pct + '%')")
                else
                coverage_percentage="unknown"
                fi
                echo "All tests in $test_file passed"
                echo "Coverage for $source_file: $coverage_percentage" 
                commit_changes
                echo "Code in $source_file is ready for inspection"
                exit $EXIT_SUCCESS
}



## MAIN starts here
# Do validation
checkParameters
# Get the module name from the parameter, change it to match test file name
source_module=$firstParameter
test_module=${firstParameter%.js}.test.js

# Set file names
test_file="$TEST_FILE_PREFIX$test_module"
source_file="$SOURCE_FILE_PREFIX$source_module"
# Check existence and syntax of test file
checkTestFile
# Extract tests from the test file
test_contents="$(< "$test_file")"
# Extract rules from the rules file
the_rules="$(< "$RULES_FILE")"
# Make a new (empty) source file if needed
fixSourceFile
# Set model paramater for llm
if [ -n "$LLM_MODEL" ]; then
        llmModelParameter="-m $LLM_MODEL"
        else
        llmModelParameter=## intentionally not set
fi

# Run initial tests, and exit if they all work
checkCode
exitIfTestsPassFirstTime

# Set up "magic loop" to call LLM and run tests again
attempt=0
new_conversation=$TRUE
echo "Planning to change $source_file based on tests in $test_file"

# Magic Loop here
while [ $attempt -lt $MAX_ATTEMPTS ] ; do # no need for  && [ $test_exit_code -ne 0 ]
	attempt=$((attempt+1))
        echo "Attempt $attempt"
        if [ $attempt -le $MAX_ATTEMPTS ]; then
                if replaceSourceWithGeneratedCode; then
                    checkCode ## which can EXIT_SUCCESSFULLY
                fi
        fi
 done

# persistenly trying hasn't helped: closing message
echo "Maximum attempts reached ($MAX_ATTEMPTS)"
echo "Exiting as generated code still does not pass tests"
exit $EXIT_TESTS_FAILED_AFTER_ITERATIONS
