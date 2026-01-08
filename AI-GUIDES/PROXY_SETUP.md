# YouTube Proxy Configuration Guide

## Why Do You Need a Proxy?

When deploying to cloud platforms (Vercel, Railway, Render, AWS, etc.), YouTube often blocks requests because:
- Cloud provider IPs are flagged as potential bots
- High volume of requests from shared IP addresses
- Automated anti-scraping protection

## Quick Setup

### 1. Choose a Proxy Provider

| Provider | Type | Price | Best For |
|----------|------|-------|----------|
| [WebShare](https://www.webshare.io/) | Residential/Datacenter | $2.99/month | Budget-friendly |
| [BrightData](https://brightdata.com/) | Residential | $500/month+ | Enterprise |
| [Oxylabs](https://oxylabs.io/) | Residential | Custom | Large scale |
| [ScraperAPI](https://www.scraperapi.com/) | Managed API | $49/month | Simplified |
| [SmartProxy](https://smartproxy.com/) | Residential | $50/month | Mid-tier |

### 2. Get Your Proxy Credentials

After signing up, you'll receive:
- Proxy host/IP address
- Port number
- Username (optional)
- Password (optional)

### 3. Configure in `.env`

```env
# Basic proxy (no authentication)
HTTP_PROXY=http://proxy.example.com:8080
HTTPS_PROXY=http://proxy.example.com:8080

# Authenticated proxy (recommended)
HTTP_PROXY=http://username:password@proxy.example.com:8080
HTTPS_PROXY=http://username:password@proxy.example.com:8080

# SOCKS5 proxy
HTTP_PROXY=socks5://username:password@proxy.example.com:1080
HTTPS_PROXY=socks5://username:password@proxy.example.com:1080
```

### 4. Deploy with Environment Variables

**Vercel:**
```bash
vercel env add HTTP_PROXY
vercel env add HTTPS_PROXY
```

**Railway:**
- Go to your project → Variables tab
- Add `HTTP_PROXY` and `HTTPS_PROXY`

**Render:**
- Dashboard → Environment → Add Variables
- Add `HTTP_PROXY` and `HTTPS_PROXY`

**Heroku:**
```bash
heroku config:set HTTP_PROXY=http://your-proxy
heroku config:set HTTPS_PROXY=http://your-proxy
```

## Testing Your Proxy

### Test Locally

```bash
# Set environment variables
export HTTP_PROXY=http://your-proxy:port
export HTTPS_PROXY=http://your-proxy:port

# Run the server
python main.py

# Check logs for confirmation
# You should see: "✓ Using proxy configuration for YouTube requests"
```

### Test Programmatically

```python
import httpx

proxies = {
    "http://": "http://your-proxy:port",
    "https://": "http://your-proxy:port"
}

response = httpx.get("https://www.youtube.com", proxies=proxies)
print(response.status_code)  # Should be 200
```

## Free Alternatives (Limited)

### 1. Free Proxy Lists
- [Free Proxy List](https://free-proxy-list.net/)
- [ProxyScrape](https://proxyscrape.com/)
- [GeoNode](https://geonode.com/free-proxy-list)

**Drawbacks:**
- Unreliable uptime
- Slow speeds
- Frequently blocked by YouTube
- No support

### 2. Residential VPN + Port Forwarding
- Use your home IP as a proxy
- Set up a VPN server at home
- Forward requests through your residential IP

**Not recommended for production.**

## Cost Optimization

### Pay-Per-Use Model
```env
# Only route YouTube requests through proxy
# Keep other traffic direct
```

### Rotating Proxies
Use rotating residential proxies to distribute load:
```env
HTTP_PROXY=http://rotating.proxy.com:port
```

### Request Caching
Cache transcript results to minimize proxy usage:
- Store fetched transcripts in Redis/Database
- Only fetch new videos
- Implement TTL for cache invalidation

## Troubleshooting

### Proxy Not Working
1. **Check proxy format:**
   ```env
   # Correct
   HTTP_PROXY=http://proxy.com:8080
   
   # Wrong
   HTTP_PROXY=proxy.com:8080  # Missing http://
   ```

2. **Verify credentials:**
   - Username/password are correct
   - Special characters are URL-encoded

3. **Test proxy independently:**
   ```bash
   curl -x http://proxy:port https://www.youtube.com
   ```

### Still Getting Blocked
- Try residential proxies instead of datacenter
- Use rotating proxy pool
- Add delays between requests
- Check proxy provider's IP reputation

### Proxy Timeout
- Increase timeout in your HTTP client
- Use faster proxy provider
- Check proxy server status

## Security Best Practices

1. **Never commit proxy credentials:**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Use environment variables:**
   - Never hardcode in source code
   - Use platform-specific secret management

3. **Encrypt credentials:**
   - Use secrets management tools
   - Rotate credentials regularly

4. **Monitor usage:**
   - Track proxy bandwidth
   - Set up alerts for unusual activity
   - Review logs regularly

## Alternative: YouTube Data API

If proxy costs are too high, consider YouTube Data API:

**Pros:**
- Official API
- No IP blocking
- Generous free quota

**Cons:**
- Requires API key
- Different response format
- May not include all transcript features

```python
# YouTube Data API alternative (not implemented)
from googleapiclient.discovery import build

youtube = build('youtube', 'v3', developerKey='YOUR_API_KEY')
```

## Support

If you continue experiencing issues:
1. Check your proxy provider's status page
2. Contact their support team
3. Test with different proxy servers
4. Review YouTube's terms of service
5. Consider implementing request throttling

## Additional Resources

- [YouTube Transcript API Docs](https://github.com/jdepoix/youtube-transcript-api)
- [Working Around IP Bans](https://github.com/jdepoix/youtube-transcript-api#working-around-ip-bans-requestblocked-or-ipblocked-exception)
- [HTTPX Proxy Documentation](https://www.python-httpx.org/advanced/#http-proxying)
