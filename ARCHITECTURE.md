# CodeFlow - Architecture Blueprint

## System Overview

CodeFlow is a mobile-first Progressive Web Application (PWA) for coding with hybrid execution capabilities. The system supports both client-side WebAssembly-based execution for interpreted languages and remote server-side execution for compiled languages.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Next.js    │  │   React      │  │  Tailwind    │         │
│  │   App Router │  │   Components │  │    CSS       │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   CodeMirror 6 Editor                    │   │
│  │  - Dynamic language extensions                           │   │
│  │  - Mobile-optimized configuration                        │   │
│  │  - Theme support (light/dark)                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Execution Engine Router                     │   │
│  │  - Language detection                                    │   │
│  │  - Client-side vs Remote routing                          │   │
│  │  - Timeout management                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            Client-Side Execution Layer                    │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │         Web Worker (execution.worker.ts)         │    │   │
│  │  │  - Pyodide (Python WASM)                          │    │   │
│  │  │  - SQL.js (SQLite WASM)                           │    │   │
│  │  │  - JavaScript Sandbox                             │    │   │
│  │  │  - Timeout controls                               │    │   │
│  │  │  - Memory management                              │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Offline Storage Layer                       │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │         IndexedDB (idb library)                   │    │   │
│  │  │  - Files store                                     │    │   │
│  │  │  - Execution logs store                            │    │   │
│  │  │  - Projects store                                  │    │   │
│  │  │  - Sync queue store                                │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Background Sync Layer                       │   │
│  │  - Online/offline detection                              │   │
│  │  - Sync queue management                                 │   │
│  │  - Retry logic with exponential backoff                  │   │
│  │  - Conflict resolution                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              PWA Layer                                   │   │
│  │  - Service Worker (sw.js)                                │   │
│  │  - Asset caching (Workbox)                               │   │
│  │  - WASM binary caching                                   │   │
│  │  - Offline fallback                                      │   │
│  │  - Background sync                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            │
┌─────────────────────────────────────────────────────────────────┐
│                      Server Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Next.js API Routes                         │   │
│  │  - /api/execute (Remote execution)                      │   │
│  │  - /api/files (File CRUD)                               │   │
│  │  - /api/execution-logs (Log storage)                    │   │
│  │  - /api/projects (Project management)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Security Middleware                         │   │
│  │  - Rate limiting (10 req/min per IP)                     │   │
│  │  - Input validation                                      │   │
│  │  - Code sanitization                                     │   │
│  │  - Security headers                                      │   │
│  │  - Request size limits                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           Remote Execution Engine                         │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │       Docker Container Orchestration              │    │   │
│  │  │  - gRPC worker pool                                 │    │   │
│  │  │  - Resource limits (CPU, memory)                    │    │   │
│  │  │  - Network isolation                                │    │   │
│  │  │  - Timeout enforcement                              │    │   │
│  │  │  - Automatic cleanup                                │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  │                                                              │   │
│  │  Supported Languages:                                        │   │
│  │  - C++ (g++ compilation)                                    │   │
│  │  - Rust (rustc compilation)                                 │   │
│  │  - Go (go build)                                            │   │
│  │  - Java (javac compilation)                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Execution Flow

### Client-Side Execution (JavaScript, Python, SQL)

```
User Input → Code Editor → Execution Router → Web Worker
                                                    │
                                                    ├─→ Python Code → Pyodide WASM → Output
                                                    ├─→ SQL Code → SQL.js WASM → Output
                                                    └─→ JavaScript Code → Sandbox → Output
                                                    │
                                                    ↓
                                              Return to UI
```

### Remote Execution (C++, Rust, Go, Java)

```
User Input → Code Editor → Execution Router → API Request
                                                    │
                                                    ↓
                                            /api/execute Endpoint
                                                    │
                                                    ├─→ Security Validation
                                                    ├─→ Rate Limiting Check
                                                    ├─→ Code Sanitization
                                                    └─→ Language Configuration
                                                    │
                                                    ↓
                                            Docker Container Creation
                                                    │
                                                    ├─→ Compile Code
                                                    ├─→ Execute with Limits
                                                    ├─→ Capture Output
                                                    └─→ Cleanup Container
                                                    │
                                                    ↓
                                              Return to UI
```

## Component Architecture

### Frontend Components

#### 1. CodeEditor Component
- **Location**: `src/components/CodeEditor.tsx`
- **Responsibilities**:
  - CodeMirror 6 integration
  - Dynamic language extension loading
  - Theme management (light/dark)
  - Mobile-optimized configuration
  - Performance optimization (tree-shaking)

#### 2. AccessoryBar Component
- **Location**: `src/components/AccessoryBar.tsx`
- **Responsibilities**:
  - Syntax symbol insertion
  - Quick action buttons
  - Mobile keyboard accessory
  - Touch-optimized UI

#### 3. SnippetLibrary Component
- **Location**: `src/components/SnippetLibrary.tsx`
- **Responsibilities**:
  - Boilerplate code insertion
  - Language-specific snippets
  - Mobile drawer interface
  - Searchable snippet library

#### 4. ConsoleOutput Component
- **Location**: `src/components/ConsoleOutput.tsx`
- **Responsibilities**:
  - Execution result display
  - Error highlighting
  - Success state indication
  - Mobile-optimized scrolling

### Backend API Routes

#### 1. Execution API
- **Location**: `src/app/api/execute/route.ts`
- **Responsibilities**:
  - Remote code execution
  - Security validation
  - Rate limiting
  - Resource management
  - Container orchestration

#### 2. Files API
- **Location**: `src/app/api/files/route.ts`
- **Responsibilities**:
  - File CRUD operations
  - Cloud storage integration
  - Metadata management

#### 3. Execution Logs API
- **Location**: `src/app/api/execution-logs/route.ts`
- **Responsibilities**:
  - Execution history storage
  - Analytics data collection
  - Debug information

#### 4. Projects API
- **Location**: `src/app/api/projects/route.ts`
- **Responsibilities**:
  - Project management
  - File organization
  - Collaboration features

## Data Flow

### Offline-First Architecture

```
User Action → IndexedDB Storage → Sync Queue
                                    │
                                    ├─→ Online: Immediate Sync
                                    └─→ Offline: Queue for Later
                                            │
                                            ↓
                                     Background Sync Process
                                            │
                                            ├─→ Retry Failed Operations
                                            ├─→ Conflict Resolution
                                            └─→ Server Synchronization
```

### IndexedDB Schema

```typescript
interface CodeFlowDB {
  files: {
    key: string
    value: {
      id: string
      name: string
      content: string
      language: string
      createdAt: number
      updatedAt: number
      synced: boolean
    }
    indexes: {
      'by-updatedAt': number
      'by-language': string
      'by-synced': boolean
    }
  }
  executionLogs: {
    key: string
    value: {
      id: string
      fileId: string
      code: string
      language: string
      output: string
      error?: string
      timestamp: number
      synced: boolean
    }
    indexes: {
      'by-fileId': string
      'by-timestamp': number
      'by-synced': boolean
    }
  }
  projects: {
    key: string
    value: {
      id: string
      name: string
      description?: string
      createdAt: number
      updatedAt: number
      fileIds: string[]
      synced: boolean
    }
    indexes: {
      'by-updatedAt': number
      'by-synced': boolean
    }
  }
  syncQueue: {
    key: string
    value: {
      id: string
      type: 'file' | 'execution' | 'project'
      operation: 'create' | 'update' | 'delete'
      data: any
      timestamp: number
      retryCount: number
    }
    indexes: {
      'by-timestamp': number
      'by-retryCount': number
    }
  }
}
```

## Security Architecture

### Client-Side Security
- **Code Sanitization**: Input validation before execution
- **Memory Limits**: Web Worker resource constraints
- **Timeout Controls**: Execution time limits
- **CSP Headers**: Content Security Policy
- **Sandboxing**: Isolated execution environments

### Server-Side Security
- **Rate Limiting**: 10 requests per minute per IP
- **Input Validation**: Comprehensive code validation
- **Container Isolation**: Docker-based execution environments
- **Resource Limits**: CPU, memory, and disk constraints
- **Network Isolation**: Restricted network access
- **Automatic Cleanup**: Container and resource cleanup
- **Security Headers**: HSTS, X-Frame-Options, etc.

## Performance Optimization

### Bundle Size Optimization
- **CodeMirror Tree-shaking**: Only load required language packages
- **Dynamic Imports**: Lazy-load extensions and features
- **WASM Caching**: Service worker caching of WASM binaries
- **Asset Optimization**: Image and font optimization

### Runtime Performance
- **Web Workers**: Non-blocking execution
- **Debouncing**: Optimized editor updates
- **Virtual Scrolling**: Large file handling
- **Memory Management**: Cleanup of unused resources

### Network Performance
- **Offline-First**: Local storage with background sync
- **CDN Caching**: WASM binaries and static assets
- **API Caching**: Response caching for repeated requests
- **Compression**: Gzip/Brotli compression

## Mobile Optimization

### Touch Interface
- **Accessory Bar**: Quick symbol insertion
- **Swipe Gestures**: Navigation between editor and console
- **Responsive Layout**: Adaptive UI for different screen sizes
- **Safe Area Support**: iPhone notch and home indicator handling

### Performance
- **Reduced Bundle**: Mobile-optimized CodeMirror configuration
- **Lazy Loading**: On-demand feature loading
- **Memory Management**: Aggressive cleanup on mobile
- **Battery Optimization**: Efficient execution patterns

## Deployment Architecture

### Development
- **Next.js Development Server**: Hot module replacement
- **Local Web Workers**: Inline worker implementation
- **Mock APIs**: Simulated backend services

### Production
- **Next.js Build**: Optimized production build
- **CDN Deployment**: Static asset distribution
- **Docker Containers**: Scalable backend execution
- **Database**: Persistent cloud storage
- **Monitoring**: Error tracking and analytics

## Scaling Considerations

### Horizontal Scaling
- **Stateless API**: Containerized execution engines
- **Load Balancing**: Distributed request handling
- **Database Sharding**: Scalable data storage
- **CDN Distribution**: Global asset delivery

### Vertical Scaling
- **Resource Limits**: Configurable execution constraints
- **Worker Pools**: Dynamic worker allocation
- **Memory Management**: Efficient resource utilization
- **Cache Optimization**: Multi-layer caching strategy

## Monitoring and Observability

### Client-Side Monitoring
- **Error Tracking**: Client error collection
- **Performance Metrics**: Bundle size, load times
- **Usage Analytics**: Feature usage statistics
- **Offline Detection**: Connectivity monitoring

### Server-Side Monitoring
- **Execution Metrics**: Success rates, latency
- **Resource Monitoring**: CPU, memory usage
- **Security Events**: Rate limiting, blocked requests
- **System Health**: Container status, availability

## Future Enhancements

### Planned Features
- **Real-time Collaboration**: Multi-user editing
- **Advanced Debugging**: Breakpoints, step-through
- **Version Control**: Git integration
- **AI Assistance**: Code completion and suggestions
- **Extended Language Support**: More language runtimes
- **Cloud Projects**: Cloud-based project storage

### Technical Improvements
- **WebAssembly Compilation**: Client-side compilation
- **Advanced Offline**: More robust offline capabilities
- **Performance Profiling**: Built-in performance tools
- **Enhanced Security**: Advanced threat detection
- **Mobile Native**: React Native implementation

## Conclusion

This architecture provides a robust, scalable foundation for a mobile-first coding platform with hybrid execution capabilities. The system balances performance, security, and user experience while maintaining offline-first functionality and progressive web app capabilities.

The modular design allows for easy extension and modification, while the comprehensive security measures ensure safe code execution in both client-side and server-side environments.
