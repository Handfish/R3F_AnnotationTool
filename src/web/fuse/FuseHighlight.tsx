import Fuse from "fuse.js";

// Finds `obj[path][to][key]` from `path.to.key`
const resolveAttribute = (obj: Fuse.FuseResult<string>, key: string) => key
  .split('.')
  .reduce((prev: any, curr: any) => prev?.[curr], obj);

// Recursively builds JSX output adding `<mark>` tags around matches
const highlight = (value: string, indices: [number, number][], i = 1): JSX.Element => {
  const pair = indices[indices.length - i];
  return !pair ? <>{value}</> : (
    <>
      {highlight(value.substring(0, pair[0]), indices, i + 1)}
      <mark>{value.substring(pair[0], pair[1] + 1)}</mark>
      {value.substring(pair[1] + 1)}
    </>
  );
};

// FuseHighlight component
const FuseHighlight = ({ hit, attribute }: { hit: Fuse.FuseResult<string>, attribute: string }) => {
  const matches = typeof hit.item === 'string'
    ? hit.matches?.[0]
    : hit.matches?.find((m: Fuse.FuseResultMatch) => m.key === attribute);
  const fallback = typeof hit.item === 'string'
    ? hit.item
    : resolveAttribute(hit.item, attribute);
  return highlight(matches?.value || fallback, matches?.indices as [number, number][]);
};

export default FuseHighlight;
