# Migration Redirect Guard

Catch a site's old URLs landing on the wrong destination after a migration. Give it an explicit old-to-new URL map; the workflow follows redirects and fails when a URL does not reach its expected destination. A scheduled agent or release workflow can consume the JSON evidence without an LLM or API key.

**Free, open-source software.** This repository is a working automation starter, not a hosted monitoring service. The example checks example.com; replace it with your own public URLs. No existing customers or paid conversions are claimed.

## Run now

Node 22 or later, no packages to install:

```sh
node --test test.js
node cli.js checks.json --fail > redirect-report.json
```

Edit `checks.json`:

```json
{"checks":[{"url":"https://your-site.example/old-page","expectedUrl":"https://your-site.example/new-page"}]}
```

Use your actual URLs. `expectedUrl` is optional for status-only checks. Equality is exact after normal URL parsing and removing fragments; query strings and trailing slashes matter.

## Run in GitHub Actions

Fork this repository, enable Actions if prompted, replace `checks.json`, then use **Actions → Migration redirect guard → Run workflow**. Changes to checks or code also trigger the workflow. The job runs tests, writes JSON evidence, and exits unsuccessfully if any result is not `pass`. Download `redirect-report` from the run's artifacts within three days. No schedule is enabled by default. GitHub usage is subject to your own account's limits.

Results include the input and expected URLs, final URL, status, full redirect path, verdict and error. A 403 or 429 is `blocked`, not proof of a broken page. Loops, wrong destinations, unresolved redirects and HTTP errors have distinct verdicts.

## Boundaries

- 1–100 explicitly listed URLs; no recursive crawl or extraction of site content. Check only sites you own or are authorized to test. No authentication, cookies or bot bypass.
- Up to nine HTTP requests per URL, ten seconds per DNS lookup/request, with a 250 ms pause between URL checks. The Actions job stops after ten minutes; large or slow batches may be incomplete.
- HTTP and HTTPS on standard ports only. Private, loopback, link-local, reserved test IPv4 and IPv6 addresses are rejected. Resolved IPv4 is pinned for each request, including each redirect.
- GET with a one-byte Range request; body is closed as soon as headers arrive. Some servers return 206 or ignore Range. Either successful 2xx passes. HTML content, JavaScript redirects and canonical tags are not inspected.
- This does not measure indexing, rankings, accessibility, page rendering or uptime over time. Report files contain submitted URLs; avoid secret query strings.

## Optional US$39 setup service

Small Batch Digital can configure one redirect guard workflow in one customer-owned GitHub repository using up to 50 URL mappings you supply. Includes one test run, a results explanation and one correction to the workflow within seven days of delivery. We work through a pull request; no account passwords are needed. Does not include changing your website's redirects, SEO consulting, ongoing monitoring or guaranteed site availability.

Email **smallbatchdigital-27@agentmail.to** with subject **Redirect Guard setup**, your repository, up to 50 URL mappings, authorization and desired delivery date. Repository access, complete inputs, scope and delivery date must be agreed before payment. Customer reviews and merges the pull request. This is AI-assisted configuration assistance.

## Payment and support

Payment is available by individual PayPal invoice after scope approval. Email **smallbatchdigital-27@agentmail.to** before paying. We must accept complete inputs and authorization, confirm capacity and agree the total price and delivery date in writing. Do not send passwords, card details, private data or tokens.

[Initial pilot slot: single-order US$39 setup invoice](https://www.paypal.com/invoice/p/#E8X7FW7Y49ATHYGZ). **This invoice is reserved for the first customer we explicitly confirm by email. Pay only after we confirm that this exact invoice is assigned to your accepted order.** It is not a reusable checkout or an open reservation. After it is paid, we will remove this public invoice link; every subsequent accepted customer receives a fresh individual invoice.

Quantity one; one-time payment; no subscription or automatic renewal. Maximum two active service orders across our services. Delivery is to your agreed contact email. Inbox, invoices and capacity are reviewed manually, not continuously. Public checkout rendering was checked, but no test charge or refund was executed; payment acceptance depends on PayPal and the customer's payment method.

If we decline an order after payment or cannot deliver the agreed scope/date and you decline a revised date, we will request a full refund through the original payment method. Refund execution has not yet been tested; processor availability and processing times apply. Contact **smallbatchdigital-27@agentmail.to** for intake, delivery questions or refund requests. This does not limit applicable customer rights. Seller: Small Batch Digital, an unincorporated venture.


## License

MIT. Use the software yourself for free; the optional setup fee is for configuration assistance.
