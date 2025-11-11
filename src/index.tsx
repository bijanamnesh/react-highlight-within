import type { CSSProperties, ReactElement, ReactNode } from "react";
import React, { cloneElement, isValidElement } from "react";

export interface HighlightOptions {
  /** The text/pattern to highlight */
  search?: string;
  /** Text color for highlighted matches (default: '#1C252E') */
  textColor?: string;
  /** Background color for highlighted matches (default: '#FFD666') */
  bgColor?: string;
  /** Whether search should be case-sensitive (default: false) */
  caseSensitive?: boolean;
  /** Custom styles for highlight span */
  highlightStyle?: CSSProperties;
}

interface MatchResult {
  start: number;
  end: number;
  text: string;
}

/**
 * Highlights matching text within a string and returns an array of React nodes
 */
const highlightTextContent = (
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
      <span
        key={`highlight-${index}`}
        style={{
          backgroundColor: bgColor,
          color: textColor,
          paddingLeft: 4,
          paddingRight: 4,
          borderRadius: 2,
          ...highlightStyle,
        }}
      >
        {matchItem.text}
      </span>
    );

    lastIndex = matchItem.end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }

  return result;
};

/**
 * Recursively traverses React elements and highlights matching text
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

  // Handle primitives
  if (typeof element === "string" || typeof element === "number") {
    return highlightTextContent(String(element), options);
  }

  // Handle null, undefined, boolean
  if (!element || typeof element === "boolean") {
    return element;
  }

  // Handle arrays
  if (Array.isArray(element)) {
    return element.map((child, index) => highlightWithin(child, options));
  }

  // Handle React elements
  if (isValidElement(element)) {
    const { children } = element.props as { children?: ReactNode };

    if (children === undefined || children === null) {
      return element;
    }

    // Process children recursively
    const processedChildren = Array.isArray(children)
      ? children.map((child) => highlightWithin(child, options))
      : highlightWithin(children, options);

    // Avoid unnecessary cloning if children unchanged
    if (processedChildren === children) {
      return element;
    }

    return cloneElement(element as ReactElement, {}, processedChildren);
  }

  return element;
};

export default highlightWithin;
