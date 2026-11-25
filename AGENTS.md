# Project-Specific Agent Instructions

## Project Overview
CodeFlow is a mobile-first Progressive Web Application (PWA) for coding with hybrid execution capabilities. This document provides specific instructions for AI agents working on this codebase.

## Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow existing component patterns in `src/components/`
- Maintain mobile-first responsive design
- Keep components modular and reusable

### File Organization
- Components: `src/components/`
- Hooks: `src/hooks/`
- Utilities: `src/lib/`
- API Routes: `src/app/api/`
- Workers: `src/workers/`

### Key Patterns

#### Component Structure
```typescript
'use client' // for client components
import { useState, useEffect } from 'react'

interface ComponentProps {
  // props definition
}

export default function Component({ props }: ComponentProps) {
  // component logic
  return <div>JSX</div>
}
```

#### Hook Pattern
```typescript
import { useState, useEffect, useCallback } from 'react'

export function useCustomHook() {
  const [state, setState] = useState(initialValue)
  
  useEffect(() => {
    // effect logic
  }, [dependencies])
  
  const action = useCallback(() => {
    // callback logic
  }, [dependencies])
  
  return { state, action }
}
```

#### API Route Pattern
```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // processing logic
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}
```

## Build Commands

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Production Start
```bash
npm start
```

### Linting
```bash
npm run lint
```

## Key Files to Reference

### Core Architecture
- `ARCHITECTURE.md` - Complete system architecture
- `README.md` - Project overview and setup
- `src/lib/db.ts` - IndexedDB operations
- `src/hooks/useSync.ts` - Offline synchronization

### Components
- `src/components/CodeEditor.tsx` - CodeMirror integration
- `src/components/AccessoryBar.tsx` - Mobile keyboard bar
- `src/components/SnippetLibrary.tsx` - Code snippets
- `src/components/ConsoleOutput.tsx` - Output display

### Configuration
- `next.config.js` - Next.js and PWA configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration

## Common Tasks

### Adding a New Language
1. Add language to `src/lib/codemirror-config.ts`
2. Add snippets to `src/components/SnippetLibrary.tsx`
3. Configure execution in `src/workers/execution.worker.ts` (client-side)
4. Add API route for remote execution if needed

### Adding a New Component
1. Create component in `src/components/`
2. Use TypeScript interfaces for props
3. Add mobile-responsive classes
4. Test on both mobile and desktop

### Modifying API Routes
1. Add route in `src/app/api/[route]/route.ts`
2. Include error handling
3. Add input validation
4. Consider rate limiting for public endpoints

### Database Operations
- Use functions from `src/lib/db.ts`
- Always handle errors gracefully
- Update sync queue for offline changes
- Test with IndexedDB DevTools

## Testing Priorities

### Mobile Testing
- Test accessory bar functionality
- Verify swipe gestures work
- Check safe area handling
- Test keyboard interactions

### Offline Testing
- Test service worker caching
- Verify IndexedDB operations
- Test background sync
- Check offline UI states

### Performance Testing
- Monitor bundle size
- Check CodeMirror load time
- Test execution worker performance
- Verify memory usage

## Security Considerations

### Code Execution
- Always validate user input
- Sanitize code before execution
- Implement timeout controls
- Use resource limits

### API Security
- Implement rate limiting
- Validate all inputs
- Use security headers
- Sanitize outputs

### Data Security
- Never store sensitive data in IndexedDB
- Use HTTPS in production
- Implement proper authentication
- Encrypt sensitive data

## Troubleshooting

### Common Issues

#### Web Worker Not Loading
- Check worker file path
- Verify MIME types
- Ensure proper worker initialization
- Check browser console for errors

#### PWA Not Installing
- Verify HTTPS (required)
- Check manifest.json validity
- Ensure service worker is registered
- Test on actual mobile device

#### Offline Sync Issues
- Clear IndexedDB and retry
- Check network connectivity
- Review sync queue in DevTools
- Verify API endpoints are accessible

#### CodeMirror Performance
- Disable unused extensions
- Use dynamic imports
- Implement virtual scrolling for large files
- Monitor memory usage

## Deployment Notes

### Environment Variables
- Copy `.env.example` to `.env.local`
- Set all required variables
- Never commit `.env.local`
- Use different values for production

### Build Optimization
- Run `npm run build` to test production build
- Check bundle size in build output
- Verify PWA assets are generated
- Test service worker in production mode

### Monitoring
- Set up error tracking (Sentry)
- Monitor API performance
- Track offline sync success rates
- Monitor execution engine health

## Extension Points

### Adding New Features
1. Review architecture first
2. Check for existing patterns
3. Maintain mobile-first approach
4. Consider offline implications
5. Update documentation

### Integration Opportunities
- Real-time collaboration (WebSockets)
- Cloud storage providers
- Authentication systems
- Payment processing
- Analytics platforms

## Performance Targets

### Bundle Size
- Initial load: < 200KB
- CodeMirror core: < 100KB
- Language extensions: < 50KB each
- Total bundle: < 500KB

### Runtime Performance
- Editor load: < 1s
- Execution init: < 2s
- Offline sync: < 5s for 100 items
- UI interactions: < 100ms

### Mobile Performance
- First paint: < 1.5s
- Interactive: < 3s
- Memory usage: < 150MB
- Battery impact: minimal

## Contact and Support

For project-specific questions:
- Review ARCHITECTURE.md first
- Check existing issues
- Consult README.md
- Contact project maintainers

---

Last updated: 2025-08-17
