// Simple Test Runner Framework for SofaFriends
// Provides assertion utilities and test suite execution

class TestRunner {
    constructor() {
        this.suites = [];
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: 0,
            suites: []
        };
    }

    // Create a test suite
    suite(name, setupFn) {
        const suite = {
            name,
            tests: [],
            beforeEach: null,
            afterEach: null,
            beforeAll: null,
            afterAll: null
        };

        const context = {
            test: (description, testFn) => {
                suite.tests.push({ description, testFn });
            },
            beforeEach: (fn) => { suite.beforeEach = fn; },
            afterEach: (fn) => { suite.afterEach = fn; },
            beforeAll: (fn) => { suite.beforeAll = fn; },
            afterAll: (fn) => { suite.afterAll = fn; }
        };

        setupFn(context);
        this.suites.push(suite);
        return this;
    }

    // Run all test suites
    async runAll() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: 0,
            suites: []
        };

        for (const suite of this.suites) {
            await this.runSuite(suite);
        }

        return this.results;
    }

    // Run a single suite
    async runSuite(suite) {
        const suiteResult = {
            name: suite.name,
            tests: [],
            duration: 0
        };

        const startTime = performance.now();

        try {
            // Run beforeAll hook
            if (suite.beforeAll) {
                await suite.beforeAll();
            }

            // Run each test
            for (const test of suite.tests) {
                const testResult = await this.runTest(test, suite);
                suiteResult.tests.push(testResult);
                this.results.total++;

                if (testResult.status === 'passed') {
                    this.results.passed++;
                } else if (testResult.status === 'failed') {
                    this.results.failed++;
                } else {
                    this.results.errors++;
                }
            }

            // Run afterAll hook
            if (suite.afterAll) {
                await suite.afterAll();
            }

        } catch (error) {
            suiteResult.error = error.message;
            this.results.errors++;
        }

        suiteResult.duration = performance.now() - startTime;
        this.results.suites.push(suiteResult);
    }

    // Run a single test
    async runTest(test, suite) {
        const result = {
            description: test.description,
            status: 'passed',
            error: null,
            duration: 0
        };

        const startTime = performance.now();

        try {
            // Run beforeEach hook
            if (suite.beforeEach) {
                await suite.beforeEach();
            }

            // Run the test
            await test.testFn(assert);

            // Run afterEach hook
            if (suite.afterEach) {
                await suite.afterEach();
            }

        } catch (error) {
            result.status = error.name === 'AssertionError' ? 'failed' : 'error';
            result.error = error.message;
            result.stack = error.stack;
        }

        result.duration = performance.now() - startTime;
        return result;
    }

    // Render results to DOM
    renderResults(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        // Summary
        const summary = document.createElement('div');
        summary.className = 'test-summary';
        const passRate = this.results.total > 0
            ? Math.round((this.results.passed / this.results.total) * 100)
            : 0;

        summary.innerHTML = `
            <h2>Test Results</h2>
            <div class="summary-stats">
                <div class="stat passed">
                    <span class="number">${this.results.passed}</span>
                    <span class="label">Passed</span>
                </div>
                <div class="stat failed">
                    <span class="number">${this.results.failed}</span>
                    <span class="label">Failed</span>
                </div>
                <div class="stat errors">
                    <span class="number">${this.results.errors}</span>
                    <span class="label">Errors</span>
                </div>
                <div class="stat total">
                    <span class="number">${this.results.total}</span>
                    <span class="label">Total</span>
                </div>
                <div class="stat pass-rate">
                    <span class="number">${passRate}%</span>
                    <span class="label">Pass Rate</span>
                </div>
            </div>
        `;
        container.appendChild(summary);

        // Suite results
        this.results.suites.forEach(suite => {
            const suiteDiv = document.createElement('div');
            suiteDiv.className = 'test-suite';

            const suiteHeader = document.createElement('div');
            suiteHeader.className = 'suite-header';

            const passed = suite.tests.filter(t => t.status === 'passed').length;
            const total = suite.tests.length;

            suiteHeader.innerHTML = `
                <h3>${suite.name}</h3>
                <span class="suite-stats">${passed}/${total} passed (${Math.round(suite.duration)}ms)</span>
            `;
            suiteDiv.appendChild(suiteHeader);

            // Test results
            const testsList = document.createElement('div');
            testsList.className = 'tests-list';

            suite.tests.forEach(test => {
                const testDiv = document.createElement('div');
                testDiv.className = `test-result ${test.status}`;

                const icon = test.status === 'passed' ? '✓' : '✗';
                const iconClass = test.status === 'passed' ? 'success' : 'failure';

                testDiv.innerHTML = `
                    <span class="test-icon ${iconClass}">${icon}</span>
                    <span class="test-description">${test.description}</span>
                    <span class="test-duration">${Math.round(test.duration)}ms</span>
                `;

                if (test.error) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'test-error';
                    errorDiv.innerHTML = `
                        <div class="error-message">${test.error}</div>
                        ${test.stack ? `<pre class="error-stack">${test.stack}</pre>` : ''}
                    `;
                    testDiv.appendChild(errorDiv);
                }

                testsList.appendChild(testDiv);
            });

            suiteDiv.appendChild(testsList);
            container.appendChild(suiteDiv);
        });
    }
}

// Assertion utilities
class AssertionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AssertionError';
    }
}

const assert = {
    // Basic assertions
    isTrue(value, message = 'Expected value to be true') {
        if (value !== true) {
            throw new AssertionError(message);
        }
    },

    isFalse(value, message = 'Expected value to be false') {
        if (value !== false) {
            throw new AssertionError(message);
        }
    },

    equal(actual, expected, message) {
        if (actual !== expected) {
            const msg = message || `Expected ${actual} to equal ${expected}`;
            throw new AssertionError(msg);
        }
    },

    notEqual(actual, expected, message) {
        if (actual === expected) {
            const msg = message || `Expected ${actual} to not equal ${expected}`;
            throw new AssertionError(msg);
        }
    },

    deepEqual(actual, expected, message) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            const msg = message || `Expected ${JSON.stringify(actual)} to deep equal ${JSON.stringify(expected)}`;
            throw new AssertionError(msg);
        }
    },

    // Type assertions
    isType(value, type, message) {
        if (typeof value !== type) {
            const msg = message || `Expected type ${type}, got ${typeof value}`;
            throw new AssertionError(msg);
        }
    },

    isObject(value, message = 'Expected value to be an object') {
        if (typeof value !== 'object' || value === null) {
            throw new AssertionError(message);
        }
    },

    isArray(value, message = 'Expected value to be an array') {
        if (!Array.isArray(value)) {
            throw new AssertionError(message);
        }
    },

    // Existence assertions
    exists(value, message = 'Expected value to exist') {
        if (value === null || value === undefined) {
            throw new AssertionError(message);
        }
    },

    notExists(value, message = 'Expected value to not exist') {
        if (value !== null && value !== undefined) {
            throw new AssertionError(message);
        }
    },

    // String assertions
    includes(string, substring, message) {
        if (!string.includes(substring)) {
            const msg = message || `Expected "${string}" to include "${substring}"`;
            throw new AssertionError(msg);
        }
    },

    // Number assertions
    greaterThan(actual, expected, message) {
        if (actual <= expected) {
            const msg = message || `Expected ${actual} to be greater than ${expected}`;
            throw new AssertionError(msg);
        }
    },

    lessThan(actual, expected, message) {
        if (actual >= expected) {
            const msg = message || `Expected ${actual} to be less than ${expected}`;
            throw new AssertionError(msg);
        }
    },

    // Function assertions
    throws(fn, expectedError, message) {
        try {
            fn();
            throw new AssertionError(message || 'Expected function to throw');
        } catch (error) {
            if (expectedError && !(error instanceof expectedError)) {
                throw new AssertionError(message || `Expected ${expectedError.name}, got ${error.name}`);
            }
            if (error instanceof AssertionError && !expectedError) {
                throw error;
            }
        }
    },

    notThrows(fn, message = 'Expected function to not throw') {
        try {
            fn();
        } catch (error) {
            throw new AssertionError(`${message}: ${error.message}`);
        }
    },

    // Async assertion
    async resolves(promise, message = 'Expected promise to resolve') {
        try {
            await promise;
        } catch (error) {
            throw new AssertionError(`${message}: ${error.message}`);
        }
    },

    async rejects(promise, message = 'Expected promise to reject') {
        try {
            await promise;
            throw new AssertionError(message);
        } catch (error) {
            if (error instanceof AssertionError) {
                throw error;
            }
            // Promise rejected as expected
        }
    }
};

// Export for use in other test files
window.TestRunner = TestRunner;
window.assert = assert;
window.AssertionError = AssertionError;
