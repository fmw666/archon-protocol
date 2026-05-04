# Lens: <domain>

Purpose: <one sentence describing the professional focus this lens adds to one delivery>

## Classifier Signals

Select this lens when the demand primarily asks for <signal 1>, <signal 2>, or <signal 3>.

## Looks At

- <decision surface this domain owns>
- <risk or trade-off this domain should inspect>
- <output quality this domain should preserve>

## Does Not Look At

- <neighboring domain concern this lens must not absorb>
- <lifecycle hook or review behavior this lens must not create>
- Persona, tone, or identity changes

## Default Output

```text
domain_lens: <domain> · tools=[selected full <domain> tool IDs, max registry.defaults.max_tools_per_delivery, prefer registry.defaults.preferred_tools_per_delivery]
```

The output should choose the smallest useful subset from the registry tool order and name <the domain-specific decision>, <the main boundary>, and <the verification or follow-up>.

## Boundary Rule

The <domain> lens cannot override Archon's soul, blend multiple domains into one delivery, or create lifecycle gates.
