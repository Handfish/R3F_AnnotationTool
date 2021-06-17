// Finds `obj[path][to][key]` from `path.to.key`
const resolveAttribute = (obj: any, key: any) => key
  .split('.')
  .reduce((prev: any, curr: any) => prev?.[curr], obj);

// Recursively builds JSX output adding `<mark>` tags around matches
const highlight = (value: any, indices = [], i = 1): any => {
  const pair = indices[indices.length - i];
  return !pair ? value : (
    <>
      {highlight(value.substring(0, pair[0]), indices, i+1)}
      <mark>{value.substring(pair[0], pair[1]+1)}</mark>
      {value.substring(pair[1]+1)}
    </>
  );
};

// FuseHighlight component
const FuseHighlight = ({ hit, attribute } : { hit:any, attribute: any }) => {
  const matches = typeof hit.item === 'string'
    ? hit.matches?.[0]
    : hit.matches?.find((m: any) => m.key === attribute);
  const fallback = typeof hit.item === 'string'
    ? hit.item
    : resolveAttribute(hit.item, attribute);
  return highlight(matches?.value || fallback, matches?.indices);
};

export default FuseHighlight;
