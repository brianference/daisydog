# DaisyDog Backend Testing Suite

This directory contains comprehensive automated tests for the DaisyDog backend, including unit tests, integration tests, performance tests, and persona-based testing simulations.

## 📁 Test Structure

```
tests/
├── conftest.py                    # Pytest configuration and shared fixtures
├── test_daisy_personality.py      # Unit tests for Daisy personality engine
├── test_database.py               # Unit tests for database operations
├── test_game_engine.py            # Unit tests for game engine functionality
├── test_api.py                    # Integration tests for FastAPI endpoints
├── test_victoria_simulation.py    # Victoria persona-based testing simulation
└── README.md                      # This documentation
```

## 🧪 Test Categories

### Unit Tests
- **Daisy Personality Engine**: Response generation, mood influence, feeding, tricks, jokes
- **Database Manager**: CRUD operations, user management, conversation storage
- **Game Engine**: Game initialization, actions, scoring, session management

### Integration Tests
- **FastAPI API Endpoints**: Chat, feeding, tricks, jokes, games, user profile
- **Authentication & Authorization**: User validation and access control
- **Error Handling**: Graceful error responses and recovery

### Performance Tests
- **Response Time**: Sub-200ms response times for typical interactions
- **Concurrent Users**: Handling multiple simultaneous users
- **Memory Usage**: Efficient resource utilization

### Security Tests
- **Input Validation**: SQL injection, XSS prevention
- **Authentication**: Token validation and session management
- **Child Safety**: Age-appropriate content filtering

### Persona-Based Tests
- **Victoria Simulation**: 8-year-old girl persona with interests in dancing, horses, dogs
- **Communication Patterns**: Enthusiastic, emoji-rich, casual typing style
- **Age-Appropriate Responses**: Content suitable for children

## 🚀 Running Tests

### Quick Start

```bash
# Install test dependencies
pip install -r requirements-test.txt

# Run all tests
python run_tests.py

# Run specific test types
python run_tests.py --type unit
python run_tests.py --type integration
python run_tests.py --type performance
```

### Test Runner Commands

```bash
# Quick smoke tests
python run_tests.py quick

# Victoria persona simulation
python run_tests.py victoria

# Performance benchmarks
python run_tests.py performance

# Child safety tests
python run_tests.py safety
```

### Advanced Options

```bash
# Run with coverage report
python run_tests.py --coverage --html-report

# Run tests in parallel
python run_tests.py --parallel

# Run specific test file
python run_tests.py --file tests/test_daisy_personality.py

# Run specific test function
python run_tests.py --function test_basic_greeting

# Verbose output
python run_tests.py --verbose
```

### Direct Pytest Commands

```bash
# Run all tests
pytest tests/

# Run with coverage
pytest --cov=. --cov-report=html tests/

# Run specific markers
pytest -m unit tests/
pytest -m integration tests/
pytest -m victoria tests/
pytest -m child_safety tests/

# Run performance tests only
pytest -m performance --benchmark-only tests/
```

## 🎯 Test Markers

Tests are organized using pytest markers:

- `@pytest.mark.unit` - Unit tests
- `@pytest.mark.integration` - Integration tests
- `@pytest.mark.performance` - Performance tests
- `@pytest.mark.security` - Security tests
- `@pytest.mark.accessibility` - Accessibility tests
- `@pytest.mark.persona` - Persona-based tests
- `@pytest.mark.victoria` - Victoria persona specific tests
- `@pytest.mark.child_safety` - Child safety tests
- `@pytest.mark.slow` - Slow running tests
- `@pytest.mark.database` - Tests requiring database
- `@pytest.mark.api` - API endpoint tests
- `@pytest.mark.game` - Game engine tests
- `@pytest.mark.personality` - Personality engine tests

## 👧 Victoria Persona Testing

The Victoria persona represents our primary target user: an 8-year-old girl who loves dancing, horses, and dogs. Her testing scenarios include:

### Communication Style
- Enthusiastic with lots of exclamation marks and emojis
- Casual spelling and abbreviations ("ur", "u", "wanna")
- High energy and rapid-fire messages
- Age-appropriate vocabulary and interests

### Test Scenarios
- **Greeting Interactions**: Enthusiastic hellos and introductions
- **Play Requests**: Games, fetch, hide and seek
- **Interest Sharing**: Dancing moves, horse riding, school stories
- **Emotional Responses**: Excitement, sadness, curiosity
- **Attention Patterns**: Short bursts, topic switching

### Validation Criteria
- All responses must be age-appropriate for 8-year-olds
- Content should be encouraging and positive
- Dog personality must be maintained
- No technical jargon or complex concepts
- Safety-first approach to all interactions

## 📊 Coverage Requirements

- **Minimum Coverage**: 80%
- **Target Coverage**: 90%+
- **Critical Components**: 95%+ (personality engine, database, API endpoints)

Coverage reports are generated in `htmlcov/index.html` when using the `--html-report` flag.

## 🛡️ Child Safety Testing

Child safety is paramount in DaisyDog. Our tests ensure:

### Content Filtering
- No inappropriate language or concepts
- Age-appropriate responses for 8-year-olds
- Educational and positive messaging
- Safe interaction patterns

### Privacy Protection
- No personal information requests
- No location or contact details
- Secure data handling
- Parental control compliance

### Behavioral Guidelines
- Encouraging and supportive responses
- Conflict resolution through play
- Positive reinforcement patterns
- Emotional support capabilities

## ⚡ Performance Benchmarks

### Response Time Targets
- **Chat Responses**: < 200ms average
- **Game Actions**: < 100ms average
- **Database Operations**: < 50ms average
- **API Endpoints**: < 300ms average

### Concurrency Targets
- **Simultaneous Users**: 100+ concurrent
- **Messages per Second**: 500+ throughput
- **Memory Usage**: < 512MB per instance
- **CPU Usage**: < 70% under load

## 🔧 Test Configuration

### Environment Variables
```bash
ENVIRONMENT=test
SUPABASE_URL=http://localhost:54321
SUPABASE_KEY=test-key
DATABASE_URL=postgresql://test:test@localhost:5432/daisydog_test
```

### Pytest Configuration
See `pytest.ini` for detailed configuration including:
- Test discovery patterns
- Coverage settings
- Async test configuration
- Warning filters
- Timeout settings

## 🚨 Troubleshooting

### Common Issues

**Import Errors**
```bash
# Ensure you're in the backend directory
cd backend/
# Install dependencies
pip install -r requirements-test.txt
```

**Database Connection Errors**
```bash
# Check test database is running
# Update DATABASE_URL in environment
export DATABASE_URL="your-test-database-url"
```

**Async Test Issues**
```bash
# Ensure pytest-asyncio is installed
pip install pytest-asyncio
# Check asyncio_mode in pytest.ini
```

**Coverage Issues**
```bash
# Install coverage dependencies
pip install coverage pytest-cov
# Run with coverage flags
pytest --cov=. --cov-report=html
```

### Debug Mode

For debugging failing tests:

```bash
# Run with verbose output and no capture
pytest -v -s tests/test_specific.py

# Run single test with debugging
pytest -v -s tests/test_file.py::test_function

# Use pdb for interactive debugging
pytest --pdb tests/test_file.py::test_function
```

## 📈 Continuous Integration

Tests are designed to run in CI/CD pipelines:

### GitHub Actions Example
```yaml
- name: Run Tests
  run: |
    cd backend
    pip install -r requirements-test.txt
    python run_tests.py --coverage --parallel
```

### Test Reports
- Coverage reports in HTML and XML formats
- Performance benchmark results
- Test result summaries with pass/fail counts
- Child safety compliance reports

## 🤝 Contributing

When adding new tests:

1. **Follow Naming Conventions**: `test_*.py` files, `test_*` functions
2. **Use Appropriate Markers**: Mark tests with relevant categories
3. **Include Victoria Scenarios**: Add persona-based test cases
4. **Ensure Child Safety**: Validate age-appropriate content
5. **Document Test Purpose**: Clear docstrings and comments
6. **Mock External Dependencies**: Use fixtures and mocks appropriately

### Test Template
```python
@pytest.mark.unit
@pytest.mark.personality
async def test_new_feature(mock_db, sample_daisy_state):
    """Test description and expected behavior"""
    # Arrange
    personality = DaisyPersonality()
    
    # Act
    result = await personality.new_feature(sample_daisy_state)
    
    # Assert
    assert result is not None
    assert is_age_appropriate_content(result, 8)
```

## 📚 Additional Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [Child Online Safety Guidelines](https://www.coppa.org/)
- [Accessibility Testing Best Practices](https://www.w3.org/WAI/test-evaluate/)

---

For questions or issues with the testing suite, please refer to the main project documentation or create an issue in the project repository.
