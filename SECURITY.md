# Security Policy

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you believe you have found a security vulnerability in Reacteo, please report it responsibly by emailing security@heaventree.co with the following information:

1. **Description** - Clear description of the vulnerability
2. **Steps to Reproduce** - Detailed steps to reproduce the issue
3. **Impact** - Potential impact of the vulnerability
4. **Your Contact Info** - How we can reach you

Please include the following details if applicable:

- Affected component (e.g., AIService, BlogService, Database)
- Affected versions
- Proof of concept or example code
- Your recommendations for fixing the vulnerability

## What to Expect

- You will receive an acknowledgment of your report within 48 hours
- We will investigate the vulnerability and determine its severity
- We will work to develop and release a fix
- We will keep you informed of our progress
- We may ask for additional information or clarification

## Vulnerability Disclosure

Once a security issue has been addressed, we will:

1. Release a patched version of Reacteo
2. Publish a security advisory on GitHub
3. Credit the security researcher (unless they prefer to remain anonymous)
4. Provide detailed information about the fix

## Security Guidelines for Users

### API Key Management

- Never commit API keys to version control
- Use Supabase Edge Function Secrets for production
- Rotate API keys regularly
- Use separate keys for development and production

### Database Security

- Enable Row Level Security (RLS) on all tables
- Implement proper authentication before accessing data
- Regularly review and update RLS policies
- Use strong passwords for database access

### Deployment Security

- Use HTTPS in production
- Keep dependencies updated
- Monitor security advisories for dependencies
- Use environment variables for sensitive data
- Implement rate limiting on API endpoints

### Code Security

- Validate all user inputs
- Use parameterized queries to prevent SQL injection
- Follow OWASP guidelines
- Implement proper error handling
- Never expose sensitive information in error messages

## Security Features

### Built-in Security

- **TypeScript** - Type safety prevents many classes of bugs
- **Row Level Security** - Database-level access control
- **CORS Configuration** - Prevents unauthorized cross-origin requests
- **Input Validation** - All user inputs are validated
- **Error Handling** - Prevents information leakage

### Best Practices

- Code reviewed by maintainers
- Dependencies regularly updated
- Security-focused development
- Clear security policies
- Responsive vulnerability handling

## Dependencies

We take the security of our dependencies seriously. We:

- Use `npm audit` regularly
- Monitor for security updates
- Update dependencies promptly
- Document all dependencies in package.json

## Third-Party Services

### Supabase

- Industry-standard PostgreSQL database
- Enterprise security features
- Regular security audits
- SOC 2 Type II compliant

### AI Providers

- OpenAI - Enterprise security
- Google Gemini - Enterprise security
- Anthropic Claude - Enterprise security
- Perplexity - Enterprise security
- Deepseek - Enterprise security

All communications with these services use HTTPS with TLS encryption.

## Known Issues

Currently, there are no known security vulnerabilities.

## Security Advisories

Security advisories will be published in the GitHub Security Advisory database when vulnerabilities are discovered and fixed.

Subscribe to releases to be notified of security updates:
- GitHub Releases: https://github.com/heaventree-ltd/reacteo/releases
- RSS Feed: https://github.com/heaventree-ltd/reacteo/releases.atom

## Responsible Disclosure

We believe in responsible disclosure and appreciate security researchers who:

- Provide clear and concise vulnerability reports
- Give us reasonable time to address issues before public disclosure
- Work with us to understand and fix the problem
- Don't access more data than necessary
- Don't degrade or disrupt service

## Security Testing

We recommend testing security before using in production:

1. Review the code and architecture
2. Test with your security tools
3. Conduct penetration testing
4. Review the security policy
5. Test the authentication and authorization

## Questions About Security?

- Check this policy: [SECURITY.md](./SECURITY.md)
- Email: security@heaventree.co
- GitHub Issues: For non-sensitive questions only

## Version History

### Version 1.0 (2024-03-11)
- Initial security policy
- Row Level Security on all tables
- API key management guidelines
- Dependency security scanning

---

Thank you for helping keep Reacteo secure!
