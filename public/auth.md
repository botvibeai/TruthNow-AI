# auth.md - TruthNowAI Agent Authentication Guide

This document defines how autonomous AI agents can discover, register, and authenticate with the TruthNowAI Cognitive Scanner API.

## Discovery Metadata
- **Protected Resource Metadata**: `/.well-known/oauth-protected-resource`
- **OAuth Authorization Server**: `/.well-known/oauth-authorization-server`
- **API Catalog**: `/.well-known/api-catalog`

## Registration Flow
TruthNowAI supports simple anonymous registration for AI agents.

### Step 1: Request an Ephemeral API Key
Agents can programmatically request transient API credentials by sending a POST request to our registration endpoint:
```http
POST /api/agent/register
Content-Type: application/json

{
  "agent_name": "AutonomousAgent/1.0",
  "identity_type": "anonymous"
}
```

### Step 2: Receive API Key Response
The server will return an ephemeral client credentials token:
```json
{
  "clientId": "agent-anon-xxxxxx",
  "clientSecret": "sk_agent_xxxxxx",
  "expiresAt": "2026-06-09T05:39:10Z"
}
```

### Step 3: Call Scanner APIs
Authenticate all subsequent API calls by including the token as a Bearer Auth token in the standard HTTP Authorization Header:
```http
Authorization: Bearer sk_agent_xxxxxx
```
