# QuantoLab — Synthetic Monitoring

This runner is for controlled monitoring/load validation of `https://quantolab.com.br/`.

## Behaviour

- Daily target varies gradually between 30 and 200 visits.
- The exact target and hourly distribution change every day.
- GitHub Actions starts an hourly window; actual visits are randomly delayed inside that window.
- Every successful visit must exit from Brazil (`loc=BR` checked through Cloudflare trace).
- Every successful visit must use a public IP not previously recorded by the runner.
- Navigation after validation is restricted to `quantolab.com.br` / `www.quantolab.com.br`.
- The runner never intentionally clicks third-party links or ads.
- Each request context includes `X-QuantoLab-Synthetic-Test: monitoring-v1` so server-side logs can identify synthetic traffic.

## Required secret

The workflow intentionally stays paused until the repository secret `BR_PROXIES_B64` exists.

Create a local CSV using this schema:

```csv
id,server,username,password,city,state
sp-001,http://HOST:PORT,USERNAME,PASSWORD,Sao Paulo,SP
rj-001,http://HOST:PORT,USERNAME,PASSWORD,Rio de Janeiro,RJ
```

Each `id` must represent an endpoint that can provide a Brazilian egress IP. The runner verifies the actual country and rejects non-Brazilian exits. To preserve the one-access/one-IP rule over time, the pool/provider must continue supplying fresh public IPs.

Encode the CSV locally:

```bash
base64 < proxies.csv | tr -d '\n'
```

Then create the repository Actions secret named `BR_PROXIES_B64` with that resulting value. Do not commit `proxies.csv` or credentials to the repository.

## Manual validation

After the secret exists, open **Actions → QuantoLab Synthetic Monitoring → Run workflow**. A manual run defaults to one synthetic visit and uses a short random window.

## Logs and state

Each run uploads a CSV artifact for 14 days. The used-IP/proxy state is carried between scheduled runs through the GitHub Actions cache. If the state cache is deliberately cleared, strict all-time deduplication can no longer be guaranteed from the runner alone; a rotating provider that guarantees fresh Brazilian exits is therefore preferable for long-running tests.
