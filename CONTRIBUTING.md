# Contributing to DuelVault

Thank you for your interest in contributing to DuelVault! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs

1. **Search existing issues** before creating a new one
2. **Use the bug report template** and provide:
   - Clear description of the issue
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, browser, etc.)
   - Screenshots if applicable

### Suggesting Features

1. **Check for existing feature requests**
2. **Use the feature request template**
3. **Provide a clear use case** and implementation ideas
4. **Consider the project scope** and alignment with goals

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** following the coding standards
4. **Test thoroughly** including edge cases
5. **Commit with clear messages**: `git commit -m "feat: add card validation"`
6. **Push to your fork**: `git push origin feature/your-feature-name`
7. **Create a Pull Request**

## 📝 Development Guidelines

### Code Style

- **TypeScript** for all new code
- **ESLint** configuration is enforced
- **Prettier** for code formatting
- **Follow existing patterns** and conventions

### Component Guidelines

- **Use shadcn/ui components** when available
- **Responsive design** is required
- **Accessibility** features must be included
- **Loading states** for async operations
- **Error handling** with user-friendly messages

### API Guidelines

- **TypeScript interfaces** for all API responses
- **Error handling** with proper HTTP status codes
- **Validation** for all input data
- **Consistent response format**

### Testing

- **Unit tests** for utility functions
- **Integration tests** for API endpoints
- **Manual testing** for UI components
- **Test OCR functionality** with various card images

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API endpoints
│   └── page.tsx        # Main pages
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── cards/         # Card-related components
│   ├── scan/          # Scanning components
│   └── ...
├── lib/               # Utilities and helpers
└── types/             # TypeScript type definitions
```

## 🎯 Areas for Contribution

### High Priority
- **OCR Accuracy Improvements**: Better text recognition
- **Mobile Responsiveness**: Enhanced mobile experience
- **Performance Optimization**: Faster scanning and loading
- **Additional Card Formats**: Support for more TCGs

### Medium Priority
- **Collection Export**: CSV, JSON export functionality
- **Advanced Search**: Filter by multiple criteria
- **Deck Building**: Create and manage decks
- **Price Tracking**: Card value integration

### Low Priority
- **Social Features**: Share collections
- **Themes**: Customizable UI themes
- **Analytics**: Collection statistics
- **API Documentation**: External API access

## 📋 Pull Request Process

### Before Submitting

1. **Test your changes** thoroughly
2. **Update documentation** if needed
3. **Add tests** for new functionality
4. **Run linting**: `npm run lint`
5. **Check for merge conflicts**

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] OCR functionality tested

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No merge conflicts
```

## 🏷️ Commit Message Guidelines

Use [Conventional Commits](https://conventionalcommits.org/) format:

```
type(scope): description

feat(scan): add batch processing
fix(ocr): improve text recognition accuracy
docs(readme): update installation instructions
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 🐛 Bug Report Template

```markdown
## Bug Description
Clear description of the issue

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g. Windows 10, macOS 12.0]
- Browser: [e.g. Chrome 96, Firefox 95]
- Version: [e.g. v1.2.3]

## Additional Context
Any other relevant information
```

## 🌟 Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this be implemented?

## Alternatives Considered
Other approaches you've thought of

## Additional Context
Any other relevant information
```

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For general questions and ideas
- **Documentation**: Check existing docs first

## 🎉 Recognition

Contributors will be:
- **Listed in README**: Attribution for all contributions
- **Featured in releases**: Highlighted in release notes
- **Invited to team**: For significant contributions

Thank you for contributing to DuelVault! 🎴✨