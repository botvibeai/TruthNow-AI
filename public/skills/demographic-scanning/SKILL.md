# demographic-scanning - Cognitive AI Biometric Verification Skill

This skill allows AI agents to programmatically parse photographic portraits and analyze demographic parameters under compliance guardrails.

## Capabilities
- **Adult vs Minor Presentation Evaluation**: Analyses skeletal ratios and cheek structure to identify minors or borderline teenager appearances to comply with COPPA, CCPA, and GDPR.
- **Biometric Aspect Classification**: Analyzes face structure to predict gender and age categories.
- **Image Authenticity Auditing**: Evaluates CMOS sensor noise profiles, generative textures, and neural synthesis boundaries (Deepfake risk check).

## Interaction Protocol
Send a base64-encoded image to the `/api/scan` endpoint. The platform's cognitive vision framework parses the metrics transiently. High-frequency image details are verified using multi-spectral biometric parameters.

### Input Schema
- `imageBase64` (string, required): Base64-encoded string of the photo.
- `mimeType` (string, optional): E.g., `image/jpeg` or `image/png`.
- `userCountrySim` (string, optional): One of `US`, `GB`, `EU`, `CA` for local compliance matching.
