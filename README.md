# react-highlight-within

Zero-dependency React utility to highlight search terms within any component tree.

<p align="center">
  <img src="./public/images/highlight-example.svg" alt="Highlight within example" width="700" />
</p>

_*Example: highlighting search terms inside a component tree.*_

## Installation

```bash
npm install react-highlight-within
```

## Usage

```tsx
import { highlightWithin } from "react-highlight-within";

function SearchResults() {
  const [search, setSearch] = useState("react");

  return (
    <div>
      {highlightWithin(
        <div>
          <h1>Learn React</h1>
          <p>React is awesome!</p>
        </div>,
        {
          search,
          bgColor: "#ffeb3b",
          textColor: "#000",
          caseSensitive: false,
        }
      )}
    </div>
  );
}
```

## API

### `highlightWithin(element, options)`

**Options:**

- `search` (string, required) - Text to highlight
- `bgColor` (string, optional) - Background color (default: '#FFD666')
- `textColor` (string, optional) - Text color (default: '#1C252E')
- `caseSensitive` (boolean, optional) - Case-sensitive search (default: false)
- `highlightStyle` (CSSProperties, optional) - Custom highlight styles

## License

MIT
