import type { CSSProperties, ReactElement, ReactNode } from "react";
import React, { cloneElement, Fragment, isValidElement } from "react";

export interface HighlightOptions {
  /** The text/pattern to highlight */
  search?: string;
  /** Text color for highlighted matches (default: '#1C252E') */
  textColor?: string;
  /** Background color for highlighted matches (default: '#FFD666') */
  bgColor?: string;
  /** Whether search should be case-sensitive (default: false) */
  caseSensitive?: boolean;
  /** Custom styles for highlight mark element */
  highlightStyle?: CSSProperties;
}

interface MatchResult {
  start: number;
  end: number;
  text: string;
}

/**
 * Processes text content and returns highlighted fragments
 */
const processTextContent = (
  text: string,
  options: HighlightOptions
): ReactNode => {
  const {
    search,
    textColor = "#1C252E",
    bgColor = "#FFD666",
    caseSensitive = false,
    highlightStyle = {},
  } = options;

  if (!search || !search.trim() || !text) {
    return text;
  }

  // Escape special regex characters
  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const flags = caseSensitive ? "g" : "gi";
  const regex = new RegExp(`(${escapedSearch})`, flags);

  const matches: MatchResult[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[0],
    });

    // Prevent infinite loop on zero-width matches
    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }
  }

  if (matches.length === 0) {
    return text;
  }

  const result: ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((matchItem, index) => {
    // Add text before match
    if (matchItem.start > lastIndex) {
      result.push(text.substring(lastIndex, matchItem.start));
    }

    // Add highlighted match
    result.push(
      <mark
        key={`highlight-${index}`}
        style={{
          display: "inline",
          backgroundColor: bgColor,
          color: textColor,
          paddingLeft: 4,
          paddingRight: 4,
          borderRadius: 2,
          border: "none",
          fontWeight: "inherit",
          fontStyle: "inherit",
          fontSize: "inherit",
          lineHeight: "inherit",
          ...highlightStyle,
        }}
      >
        {matchItem.text}
      </mark>
    );

    lastIndex = matchItem.end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }

  return <>{result}</>;
};

/**
 * Recursively traverses React elements and highlights matching text.
 * Leaf text nodes are always wrapped in a span with unicodeBidi for proper text direction handling.
 * 
 * @param element - The React node to process
 * @param options - Highlighting options
 * @returns The element with highlighted text
 * 
 * @example
 *
```tsx
 * <div>
 *   {highlightWithin(
 *     <p>Hello World</p>,
 *     { search: 'world', bgColor: '#ffff00' }
 *   )}
 * </div>
 *```
 */
export const highlightWithin = (
  element: ReactNode,
  options: HighlightOptions
): ReactNode => {
  if (!options.search || !options.search.trim()) {
    return element;
  }

  // Handle primitives (leaf nodes)
  if (typeof element === "string" || typeof element === "number") {
    const processed = processTextContent(String(element), options);

    // Always wrap text content in span for bidi handling
    return (
      <span
        style={{
          display: "inline",
          unicodeBidi: "embed",
        }}
      >
        {processed}
      </span>
    );
  }

  // Handle null, undefined, boolean
  if (!element || typeof element === "boolean") {
    return element;
  }

  // Handle arrays
  if (Array.isArray(element)) {
    return element.map((child, index) => (
      <Fragment key={index}>{highlightWithin(child, options)}</Fragment>
    ));
  }

  // Handle React elements
  if (isValidElement(element)) {
    const { children, ...props } = element.props as any;

    if (children === undefined || children === null) {
      return element;
    }

    // Process children recursively
    const processedChildren = Array.isArray(children)
      ? children.map((child) => highlightWithin(child, options))
      : highlightWithin(children, options);

    // Check if this element has ONLY primitive children (leaf level)
    const hasOnlyPrimitiveChildren = Array.isArray(children)
      ? children.every(
          (child) => typeof child === "string" || typeof child === "number"
        )
      : typeof children === "string" || typeof children === "number";

    // Apply wrapper at leaf level for primitive children
    if (hasOnlyPrimitiveChildren) {
      const wrappedChildren = (
        <span
          style={{
            display: "inline",
            unicodeBidi: "embed",
          }}
        >
          {processedChildren}
        </span>
      );
      return cloneElement(element as ReactElement, props, wrappedChildren);
    }

    // Avoid unnecessary cloning if children unchanged
    if (processedChildren === children) {
      return element;
    }

    return cloneElement(element as ReactElement, props, processedChildren);
  }

  return element;
};

export default highlightWithin;
