interface CacheEntry<T> {
  data: T
  timestamp: number
  promise?: Promise<T>
  ttl: number
}

class RequestCache {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  async get<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const now = Date.now()
    const cached = this.cache.get(key)

    // Check if we have valid cached data
    if (cached && now - cached.timestamp < cached.ttl) {
      return cached.data
    }

    // Check if there's an ongoing request for this key
    if (cached?.promise) {
      return cached.promise
    }

    // Create new request
    const promise = fetcher().then(data => {
      this.cache.set(key, {
        data,
        timestamp: now,
        ttl
      })
      return data
    }).catch(error => {
      // Remove failed request from cache
      this.cache.delete(key)
      throw error
    })

    // Store the promise to prevent duplicate requests
    this.cache.set(key, {
      data: null as any,
      timestamp: now,
      ttl,
      promise
    })

    return promise
  }

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl && !entry.promise) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache stats for debugging
  getStats() {
    const now = Date.now()
    let validEntries = 0
    let expiredEntries = 0
    let pendingRequests = 0

    for (const entry of this.cache.values()) {
      if (entry.promise) {
        pendingRequests++
      } else if (now - entry.timestamp > entry.ttl) {
        expiredEntries++
      } else {
        validEntries++
      }
    }

    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries,
      pending: pendingRequests
    }
  }
}

export const requestCache = new RequestCache()

// Clean up cache every 5 minutes
setInterval(() => {
  requestCache.cleanup()
}, 5 * 60 * 1000)

// Log cache stats every 10 minutes in development
if (import.meta.env.DEV) {
  setInterval(() => {
    const stats = requestCache.getStats()
    if (stats.total > 0) {
      console.log('Request Cache Stats:', stats)
    }
  }, 10 * 60 * 1000)
} 