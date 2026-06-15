export async function handleCreateFileFunction(
  uploadedFiles,
  checkForDuplicates,
  setDuplicateErrors,
  processingTimeoutRef,
  setIsProcessing,
  getRawFileData,
  formatFileSize,
  files,
  createFile,
  folderId,
  setFiles,
  onCommitFiles,
  showToasts,
  releasePreviewMemory,
  removeFile,
  onClose,
) {
  if (!uploadedFiles || uploadedFiles.length === 0) return;

  const { duplicates, uniqueFiles } = checkForDuplicates(uploadedFiles);
  if (duplicates.length > 0 && uniqueFiles.length === 0) {
    setDuplicateErrors(
      duplicates.map(
        (name) => `File match collision: "${name}" already exists.`,
      ),
    );
    return;
  }

  // Safety check: Clear any pre-existing processing timeout instance before firing a new one
  if (processingTimeoutRef.current) {
    clearTimeout(processingTimeoutRef.current);
  }

  setIsProcessing(true);

  // Store the timeout handle in our mutable reference holder
  processingTimeoutRef.current = setTimeout(async () => {
    try {
      // Process all selected files concurrently
      const newFileNodes = await Promise.all(
        uniqueFiles.map(async (stagedFile) => {
          const fileExtension = stagedFile.name.split('.').pop() || '';
          const date = new Date(
            stagedFile.lastModified || Date.now(),
          ).toLocaleString();
          const fileRawData = await getRawFileData(stagedFile.file);

          return {
            id: `${crypto.randomUUID()}`,
            name: stagedFile.name,
            type: 'file',
            data: {
              file: fileRawData,
              size: formatFileSize(stagedFile.size),
              format: fileExtension.toLowerCase(),
              dateCreated: date,
            },
          };
        }),
      );

      let updatedTree = [...files];
      for (const newFileNode of newFileNodes) {
        updatedTree = createFile(updatedTree, folderId || null, newFileNode);
      }

      setFiles(updatedTree);

      if (onCommitFiles) {
        onCommitFiles(uniqueFiles);
      }
      if (uniqueFiles.length > 0) showToasts('file');

      // Cleanup memory previews
      if (uploadedFiles) {
        releasePreviewMemory(uploadedFiles);
      }

      // Clear out hook states step-by-step
      if (uploadedFiles && uploadedFiles.length > 0) {
        const targetIds = uploadedFiles.map((f) => f.id);
        targetIds.forEach((id) => removeFile(id));
      }

      setDuplicateErrors([]);
      onClose();
    } catch (error) {
      console.error('Failed to parse streams safely:', error);
    } finally {
      setIsProcessing(false);
      // Clear the reference pointer when done
      processingTimeoutRef.current = null;
    }
  }, 50);
}
