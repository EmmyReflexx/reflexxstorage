/**
 * Checks if a file or folder name already exists in the current directory
 * @param {Array} nodes - The current tree nodes to check against
 * @param {string} name - The name to check
 * @param {string} type - 'file' or 'folder'
 * @returns {boolean} - True if duplicate exists
 */
export function isDuplicateName(nodes, name, type) {
  if (!nodes || !Array.isArray(nodes)) return false;

  return nodes.some(
    (node) =>
      node.type === type && node.name.toLowerCase() === name.toLowerCase(),
  );
}

/**
 * Gets duplicate error message
 */
export function getDuplicateErrorMessage(name, type) {
  return `${type === 'file' ? 'File' : 'Folder'} "${name}" already exists in this location.`;
}
