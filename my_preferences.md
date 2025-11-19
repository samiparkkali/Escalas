# My Coding Preferences

## 1. Coding Style Preferences
- Use **Classes** consistently for modularity and clarity.
- Write **clean, readable, and well-documented code**.
- Prefer **type hints** in Python for maintainability.
- Keep functions and methods **short and focused**.
- Use **descriptive variable and method names**.
- Favor **explicit over implicit** (PEP 20 - The Zen of Python).
- Maintain consistent **indentation (4 spaces)** and line length (~80-100 chars).
- **Don't use any comments**.

## 2. Common Patterns I Like
- Follow **Clean Architecture principles**:
  - Separate **domain logic**, **data access**, and **UI/API layers**.
  - Use **interfaces/abstract classes** to invert dependencies.
- Adhere to **SOLID principles** in class design.
- Start with a **simple, minimal working prototype** before adding complexity.
- Use **factory methods or builders** for complex objects.
- Prefer **composition over inheritance**.
- Use **context managers** and **generators** where appropriate.
- Write **unit tests** alongside or immediately after code implementation.

## 3. Preferred Frameworks / Libraries
- Prefer **Python Standard Library** first to minimize dependencies.
- For web APIs: **FastAPI** or **Flask**.
- For data: **pandas**, **numpy**.
- For ML/AI: **scikit-learn**, **PyTorch**, **TensorFlow** depending on the task.
- For async: **asyncio**, **httpx**.
- For dependency injection: **dependency-injector** or manual DI patterns.
- Testing with **pytest**.

## 4. Conventions I Follow
- Always begin with a **simple draft implementation** on first request.
- Incrementally **refine and add features** in subsequent iterations.
- Use **Google-style or reStructuredText docstrings**.
- Prefix private class members with a single underscore (`_`).
- Use **snake_case** for variables/functions, **PascalCase** for classes.
- Raise **specific exceptions** with clear error messages.

## 5. README File Instructions
- Write README in **very simple, clear language**.
- Explain **what the project is** in 1-2 sentences.
- Include **basic usage instructions** in a few easy steps.
- State **why the project is designed that way** (briefly).
- List **prerequisites or requirements** simply.
- Avoid jargon; aim for **clarity and simplicity**.
- Think of README like an **instruction card for a beginner**.
- Keep it **short and to the point** (ideally under one page).