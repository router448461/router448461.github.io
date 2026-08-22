# ROUTER 448461 IPFS mirror

The production site is a static directory, so the same files can be published to IPFS without changing the normal site.

## Current workflow

`.github/workflows/ipfs.yml` publishes the repository's static files to IPFS using Pinata whenever the `router448461.com` branch is pushed or the workflow is manually dispatched.

The workflow requires two GitHub Actions secrets:

- `PINATA_API_KEY`
- `PINATA_SECRET_API_KEY`

The workflow uses the Pinata pinner through `@agentofuser/ipfs-deploy`. The tool returns the resulting IPFS CID in the Actions log.

## After the first successful deployment

The resulting site can be retrieved through the Cloudflare gateway using:

`https://ipfs.router448461.com/ipfs/<CID>/`

The CID identifies the exact content. Changing any deployed file produces a different CID.

## Important distinction

`ipfs.router448461.com` is a Cloudflare IPFS gateway. It retrieves IPFS content but does not itself provide permanent storage or pinning. The pinning service is therefore the persistence layer.

## Recommended redundancy

Keep the normal GitHub/Pages deployment as the primary web address and Pinata as the IPFS persistence layer. A second pinning provider can be added later for additional redundancy.
