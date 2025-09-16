#!/usr/bin/env python3
"""
DaisyDog Backend Test Runner
Provides easy commands to run different types of tests
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path


def run_command(cmd, description=""):
    """Run a command and handle output"""
    print(f"\n{'='*60}")
    if description:
        print(f"Running: {description}")
    print(f"Command: {cmd}")
    print('='*60)
    
    result = subprocess.run(cmd, shell=True, capture_output=False)
    
    if result.returncode != 0:
        print(f"\n❌ Command failed with exit code {result.returncode}")
        return False
    else:
        print(f"\n✅ Command completed successfully")
        return True


def setup_environment():
    """Set up test environment"""
    os.environ["ENVIRONMENT"] = "test"
    os.environ["SUPABASE_URL"] = "http://localhost:54321"
    os.environ["SUPABASE_KEY"] = "test-key"
    os.environ["DATABASE_URL"] = "postgresql://test:test@localhost:5432/daisydog_test"


def main():
    parser = argparse.ArgumentParser(description="DaisyDog Backend Test Runner")
    parser.add_argument("--type", "-t", 
                       choices=["all", "unit", "integration", "performance", "security", 
                               "accessibility", "persona", "victoria", "child_safety"],
                       default="all",
                       help="Type of tests to run")
    parser.add_argument("--coverage", "-c", action="store_true",
                       help="Run with coverage report")
    parser.add_argument("--verbose", "-v", action="store_true",
                       help="Verbose output")
    parser.add_argument("--parallel", "-p", action="store_true",
                       help="Run tests in parallel")
    parser.add_argument("--file", "-f", type=str,
                       help="Run specific test file")
    parser.add_argument("--function", "-fn", type=str,
                       help="Run specific test function")
    parser.add_argument("--install", "-i", action="store_true",
                       help="Install test dependencies first")
    parser.add_argument("--html-report", action="store_true",
                       help="Generate HTML coverage report")
    parser.add_argument("--benchmark", "-b", action="store_true",
                       help="Run performance benchmarks")
    
    args = parser.parse_args()
    
    # Setup environment
    setup_environment()
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    success = True
    
    # Install dependencies if requested
    if args.install:
        print("Installing test dependencies...")
        success &= run_command("pip install -r requirements-test.txt", 
                              "Installing test dependencies")
        if not success:
            return 1
    
    # Build pytest command
    cmd_parts = ["python", "-m", "pytest"]
    
    # Add verbosity
    if args.verbose:
        cmd_parts.append("-v")
    else:
        cmd_parts.append("-q")
    
    # Add coverage
    if args.coverage or args.html_report:
        cmd_parts.extend(["--cov=.", "--cov-report=term-missing"])
        if args.html_report:
            cmd_parts.append("--cov-report=html")
    
    # Add parallel execution
    if args.parallel:
        cmd_parts.extend(["-n", "auto"])
    
    # Add benchmark
    if args.benchmark:
        cmd_parts.append("--benchmark-only")
    
    # Add specific file or function
    if args.file:
        if args.function:
            cmd_parts.append(f"{args.file}::{args.function}")
        else:
            cmd_parts.append(args.file)
    elif args.function:
        cmd_parts.extend(["-k", args.function])
    
    # Add test type markers
    if args.type != "all":
        cmd_parts.extend(["-m", args.type])
    
    # Add test directory
    if not args.file:
        cmd_parts.append("tests/")
    
    # Run tests
    cmd = " ".join(cmd_parts)
    success &= run_command(cmd, f"Running {args.type} tests")
    
    # Generate reports
    if success and args.html_report:
        print("\n📊 Coverage report generated in htmlcov/index.html")
    
    return 0 if success else 1


def run_quick_tests():
    """Run quick smoke tests"""
    setup_environment()
    
    print("🚀 Running quick smoke tests...")
    
    tests = [
        ("Unit Tests", "python -m pytest tests/test_daisy_personality.py::TestDaisyPersonality::test_basic_greeting -v"),
        ("Database Tests", "python -m pytest tests/test_database.py::TestDatabaseManager::test_get_user -v"),
        ("Game Engine Tests", "python -m pytest tests/test_game_engine.py::TestGameEngine::test_start_fetch_game -v"),
        ("API Tests", "python -m pytest tests/test_api.py::TestChatAPI::test_chat_endpoint -v"),
    ]
    
    all_passed = True
    for name, cmd in tests:
        print(f"\n🧪 {name}")
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {name} passed")
        else:
            print(f"❌ {name} failed")
            print(result.stdout)
            print(result.stderr)
            all_passed = False
    
    if all_passed:
        print("\n🎉 All quick tests passed!")
        return 0
    else:
        print("\n💥 Some tests failed!")
        return 1


def run_victoria_simulation():
    """Run Victoria persona simulation"""
    setup_environment()
    
    print("👧 Running Victoria persona simulation...")
    
    cmd = "python -m pytest tests/test_victoria_simulation.py -v --tb=short"
    success = run_command(cmd, "Victoria persona simulation")
    
    if success:
        print("\n🎉 Victoria simulation completed successfully!")
        return 0
    else:
        print("\n💥 Victoria simulation failed!")
        return 1


def run_performance_tests():
    """Run performance tests"""
    setup_environment()
    
    print("⚡ Running performance tests...")
    
    cmd = "python -m pytest -m performance --benchmark-only --benchmark-sort=mean -v"
    success = run_command(cmd, "Performance tests")
    
    if success:
        print("\n🎉 Performance tests completed!")
        return 0
    else:
        print("\n💥 Performance tests failed!")
        return 1


def run_child_safety_tests():
    """Run child safety tests"""
    setup_environment()
    
    print("🛡️ Running child safety tests...")
    
    cmd = "python -m pytest -m child_safety -v --tb=short"
    success = run_command(cmd, "Child safety tests")
    
    if success:
        print("\n🎉 Child safety tests passed!")
        return 0
    else:
        print("\n💥 Child safety tests failed!")
        return 1


if __name__ == "__main__":
    # Check if specific function was called
    if len(sys.argv) > 1:
        if sys.argv[1] == "quick":
            sys.exit(run_quick_tests())
        elif sys.argv[1] == "victoria":
            sys.exit(run_victoria_simulation())
        elif sys.argv[1] == "performance":
            sys.exit(run_performance_tests())
        elif sys.argv[1] == "safety":
            sys.exit(run_child_safety_tests())
    
    # Run main function
    sys.exit(main())
