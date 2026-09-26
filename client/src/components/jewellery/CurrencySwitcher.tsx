import { availableCurrencies, type CurrencyCode } from "@shared/jewellery/currency";
import { setCurrency, useCurrency } from "@/lib/currency";

/** Small currency picker with its current display currency. */
export default function CurrencySwitcher({ id = "currency" }: { id?: string }) {
  const currency = useCurrency();
  const options = availableCurrencies();
  if (options.length < 2) return null;
  return (
    <span className="jw-currency">
      <span className="jw-currency-label">Prices in {currency}</span>
      <select id={id} aria-label="Currency" value={currency} onChange={(event) => setCurrency(event.target.value as CurrencyCode)}>
        {options.map((option) => (
          <option key={option.code} value={option.code}>{option.label}</option>
        ))}
      </select>
    </span>
  );
}
