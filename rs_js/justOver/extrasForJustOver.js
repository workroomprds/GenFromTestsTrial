	// just over test
  test('Example: 63 seconds is just over 1 minute', () => {
    const result = relativeSizes.convert(63, "seconds", createTimeScale());
    expect(result).toBe("63 seconds is just over 1 minute");
  });

  // just over test
  test('Example: 66 seconds is 1.1 minute', () => {
    const result = relativeSizes.convert(66, "seconds", createTimeScale());
    expect(result).toBe("66 seconds is 1.1 minutes");
  });
	
	// maybe run 123 / just over 2, 126 is 2.1?
	// maybe do hours, or days -> years?
	// maybe do jsut under?
	// maybe do exactly?