// index.test.js
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { JSDOM } from 'jsdom';
import { expect, test, describe } from '@jest/globals';

// Get correct __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Index.html tests', () => {
  let document;

  beforeAll(() => {
    // Load the HTML file
    const htmlPath = resolve(__dirname, '../../index.html');
    const html = readFileSync(htmlPath, 'utf8');
    const dom = new JSDOM(html, {
      runScripts: 'outside-only', // Don't execute scripts for safety
      resources: 'usable' // Allows checking resource loading (though doesn't actually load them)
    });
    document = dom.window.document;
  });

  test('Required HTML elements exist', () => {
    const inputValue = document.getElementById('input_value');
    const inputSlider = document.getElementById('input_slider');
    const scaleChoice = document.getElementById('scale_choice');
    const unitChoice = document.getElementById('unit_choice');
    const outputInfo = document.getElementById('output_info');

    expect(inputValue).not.toBeNull();
    expect(inputSlider).not.toBeNull();
    expect(scaleChoice).not.toBeNull();
    expect(unitChoice).not.toBeNull();
    expect(outputInfo).not.toBeNull();
  });

  test('Input elements have correct types', () => {
    const inputValue = document.getElementById('input_value');
    const inputSlider = document.getElementById('input_slider');
    const scaleChoice = document.getElementById('scale_choice');
    const unitChoice = document.getElementById('unit_choice');

    expect(inputValue.tagName).toBe('INPUT');

    expect(inputSlider.tagName).toBe('INPUT');
    expect(inputSlider.type).toBe('range');

    expect(scaleChoice.tagName).toBe('SELECT');
    expect(unitChoice.tagName).toBe('SELECT');
  });

  test('Page has correct title', () => {
    expect(document.title).toBe('relative sizes');
  });


  test('Required stylesheet is included', () => {
    const links = Array.from(document.getElementsByTagName('link'));
    const stylesheets = links
      .filter(link => link.rel === 'stylesheet')
      .map(link => link.href);

    expect(
      stylesheets.some(href => href.includes('styles.css'))
    ).toBeTruthy();
  });

  test('Page has responsive viewport meta tag', () => {
    const metaTags = Array.from(document.getElementsByTagName('meta'));
    const viewportTag = metaTags.find(tag => tag.name === 'viewport');

    expect(viewportTag).toBeDefined();
    expect(viewportTag.content).toContain('width=device-width');
  });

  test('Required scripts are included', () => {
    const scripts = Array.from(document.getElementsByTagName('script'));
    const scriptSources = scripts.map(script => script.src);

    const requiredScripts = [
      'integrator.js'
    ];

    for (const requiredScript of requiredScripts) {
      expect(
        scriptSources.some(src => src.includes(requiredScript))
      ).toBeTruthy();
    }
  });

  test('Page uses module scripts', () => {
    const scripts = Array.from(document.getElementsByTagName('script'));
    const moduleScripts = scripts.filter(script => script.type === 'module');

    // Check that at least one module script exists
    expect(moduleScripts.length).toBeGreaterThan(0);

    // Check for inline module script that imports integrator
    const hasIntegratorImport = moduleScripts.some(script => {
      const content = script.textContent || '';
      return content.includes('./src/js/integrator.js');
    });
  });
});