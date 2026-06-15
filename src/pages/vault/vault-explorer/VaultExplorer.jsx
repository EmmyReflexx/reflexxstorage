import { vaultTree } from '../../../store/vaultTree';
import { useReflexxValue } from '../../../Reflexx_Tools/reflexx-state';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useFileUpload } from '../../../Reflexx_Tools/file-upload';
import { useToast, ToastContainer } from '../../../Reflexx_Tools/react-toast';
import { Helmet } from 'react-helmet-async';
import { TreeNode } from '../../../components/explorer/TreeNode';
import { BreadCrumb } from '../../../components/breadcrumb/BreadCrumb';
import { SpeedDial } from 'primereact/speeddial';
import { FolderPlus, Upload, Lock } from 'lucide-react';
import { FileUploadModal } from '../../../components/explorer/file-upload/FileUploadModal';
import { DeleteConfirmModal } from '../../../components/explorer/DeleteConfirmModal';
import { FolderModal } from '../../../components/explorer/FolderModal';
import Header from '../../../components/headers/Header';

// Walks up the tree to figure out where we are and builds the clickable breadcrumb trail
function buildBreadcrumbPath(nodes, targetId, currentPath = []) {
  if (!nodes) return null;
  for (const node of nodes) {
    if (node.type === 'folder') {
      const newPath = [...currentPath, { id: node.id, name: node.name }];
      if (node.id === targetId) return newPath;
      if (node.children) {
        const deepMatch = buildBreadcrumbPath(node.children, targetId, newPath);
        if (deepMatch) return deepMatch;
      }
    }
  }
  return null;
}

// Digs through the tree to find a specific folder by its ID
function findFolderById(nodes, id) {
  if (!nodes) return null;
  for (const node of nodes) {
    if (node.id === id && node.type === 'folder') return node;
    if (node.children) {
      const foundInChildren = findFolderById(node.children, id);
      if (foundInChildren) return foundInChildren;
    }
  }
  return null;
}

export function VaultExplorer() {
  const { toasts, removeToast, success } = useToast();

  // Show different toast messages depending on what action just happened
  function showToasts(action) {
    if (action === 'file') {
      success('Files upload successful', {
        duration: 2000,
      });
    } else if (action === 'folder') {
      success('Folder created successfully', {
        duration: 2000,
      });
    } else if (action === 'rename') {
      success('Rename successful', {
        duration: 2000,
      });
    } else if (action === 'delete') {
      success('Delete successful', {
        duration: 2000,
      });
    }
  }
  // Handles drag-and-drop, file selection, and preview generation for the vault
  const uploadProps = useFileUpload({
    multiple: true,
    enableDragDetection: true,
    maxSize: 100 * 1024 * 1024,
  });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  // Pulls the vault tree from global state - this one is separate from the regular file tree
  const [files, setFiles] = useReflexxValue(vaultTree, 'files');

  // Grabs the folder ID from the URL so we know which directory we're viewing
  const { folderId } = useParams();

  // Tracks which item is being deleted and whether the confirmation modal is visible
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    targetNode: null,
  });

  // Tracks which item is being renamed
  const [renameModal, setRenameModal] = useState({
    isOpen: false,
    targetNode: null,
  });

  // Figures out what to show - either the current folder's contents or the vault root
  const currentFolder = folderId ? findFolderById(files, folderId) : null;
  const nodesToRender = currentFolder ? currentFolder.children : files;

  // Builds the breadcrumb path based on the current folder ID
  const pathSequence = folderId ? buildBreadcrumbPath(files, folderId) : [];

  // Recursively adds a new folder to the correct spot in the vault tree
  function createFolder(nodes, targetId, newFolder) {
    if (!nodes) return;
    if (!targetId) {
      return [...nodes, newFolder];
    }

    return nodes.map((node) => {
      if (node.id === targetId && node.type === 'folder') {
        return {
          ...node,
          children: node.children ? [...node.children, newFolder] : [newFolder],
        };
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: createFolder(node.children, targetId, newFolder),
        };
      }

      return node;
    });
  }

  // Recursively removes a node and all its children from the vault tree
  function deleteNodeFromTree(nodes, targetId) {
    if (!nodes) return [];
    return nodes
      .filter((node) => node.id !== targetId)
      .map((node) => {
        if (node.children) {
          return {
            ...node,
            children: deleteNodeFromTree(node.children, targetId),
          };
        }
        return node;
      });
  }

  // Recursively finds a node and updates its name in the vault tree
  function renameNodeInTree(nodes, targetId, newName) {
    if (!nodes) return [];

    return nodes.map((node) => {
      if (node.id === targetId) {
        return { ...node, name: newName };
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: renameNodeInTree(node.children, targetId, newName),
        };
      }
      return node;
    });
  }

  // Opens the create secure folder dialog
  function handleOpenFolderModal(e) {
    if (e && e.originalEvent) {
      e.originalEvent.stopPropagation();
    }
    setIsFolderModalOpen(true);
  }

  // Creates the actual folder object and saves it to the vault tree
  function handleFolderSubmit(folderName) {
    const newFolder = {
      id: `${crypto.randomUUID()}`,
      name: folderName,
      type: 'folder',
      children: [],
    };
    const updateTree = createFolder(files, folderId || null, newFolder);
    setFiles(updateTree);
  }

  // Runs when user confirms deletion - removes the node from vault state
  function handleExecuteDelete(node) {
    const updatedTree = deleteNodeFromTree(files, node.id);
    setFiles(updatedTree);
  }

  // Opens the rename modal for the selected node in the vault
  function handleOpenRenameModal(node) {
    setRenameModal({ isOpen: true, targetNode: node });
  }

  // Saves the new name after user submits the rename form in the vault
  function handleRenameSubmit(newName) {
    const { targetNode } = renameModal;
    if (!targetNode || !newName.trim()) return;

    const updatedTree = renameNodeInTree(files, targetNode.id, newName.trim());
    setFiles(updatedTree);
    setRenameModal({ isOpen: false, targetNode: null });
  }

  // Floating action buttons for the vault - styled slightly differently with a lock icon
  const speedDialItems = [
    {
      label: 'New Secure Folder',
      icon: () => <FolderPlus size={18} className="text-text-main" />,
      command: handleOpenFolderModal,
      template: (item, options) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            options.onClick(e);
          }}
          className="flex items-center justify-center w-12 h-12 rounded-full border border-neon-edge bg-glass-effect backdrop-blur-md text-text-main hover:bg-hover-light hover:scale-105 shadow-md transition-all duration-300 group relative"
          title={item.label}
        >
          {item.icon()}
          <span className="absolute right-14 scale-100 md:scale-0 md:group-hover:scale-100 bg-bg-surface border border-neon-edge text-text-main font-lexend-r text-xs px-2.5 py-1.5 rounded-xl shadow-lg transition-all duration-200 pointer-events-none whitespace-nowrap">
            {item.label}
          </span>
        </button>
      ),
    },
    {
      label: 'Upload Encrypted File',
      icon: () => <Upload size={18} className="text-text-main" />,
      command: () => {
        setIsUploadModalOpen(true);
      },
      template: (item, options) => (
        <button
          onClick={(e) => {
            e?.stopPropagation();
            options.onClick(e);
          }}
          className="flex items-center justify-center w-12 h-12 rounded-full border border-neon-edge bg-glass-effect backdrop-blur-md text-text-main hover:bg-hover-light hover:scale-105 shadow-md transition-all duration-300 group relative"
          title={item.label}
        >
          {item.icon()}
          <span className="absolute right-14 scale-100 md:scale-0 md:group-hover:scale-100 bg-bg-surface border border-neon-edge text-text-main font-lexend-r text-xs px-2.5 py-1.5 rounded-xl shadow-lg transition-all duration-200 pointer-events-none whitespace-nowrap">
            {item.label}
          </span>
        </button>
      ),
    },
  ];

  return (
    <>
    <Helmet>
      <title>Reflexx | Encrypted Vault</title>
      <meta name="description" content="Manage your encrypted files in a secure vault" />
    </Helmet>
    <div className="relative min-h-screen bg-bg-canvas pb-24 transition-colors duration-300">
      <Header />
      <BreadCrumb path={pathSequence} basePath="/vault-explorer" />

      {/* Vault Directory Grid View */}
      <div className="pt-18">
        <TreeNode
          nodes={nodesToRender}
          isRoot={!folderId}
          basePath="/vault-explorer"
          onDeleteNode={(node) =>
            setDeleteModal({ isOpen: true, targetNode: node })
          }
          onRenameNode={handleOpenRenameModal}
        />
      </div>

      {/* Floating Interactive Action Menu with lock icon for vault branding */}
      <SpeedDial
        model={speedDialItems}
        direction="up"
        type="linear"
        transitionDelay={60}
        showIcon={() => (
          <Lock
            size={22}
            className="text-black transition-transform duration-300 group-hover:rotate-90"
          />
        )}
        hideIcon={() => <Lock size={22} className="text-black rotate-45" />}
        className="fixed bottom-8 right-8 z-50"
        buttonClassName="w-14 h-14 rounded-full bg-brand-neon hover:bg-brand-glow border-none shadow-lg shadow-brand-neon/20 hover:shadow-brand-glow/40 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group focus:outline-none focus:ring-0"
        listclassname="space-y-3 pb-3"
      />

      {/* Dynamic Folder Setup Dialog */}
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onSubmit={handleFolderSubmit}
        mode="create"
        existingNodes={nodesToRender || []}
        currentFolderId={folderId || null}
        showToasts={showToasts}
      />

      {/* Rename Modal */}
      <FolderModal
        isOpen={renameModal.isOpen}
        onClose={() => setRenameModal({ isOpen: false, targetNode: null })}
        onSubmit={handleRenameSubmit}
        initialValue={renameModal.targetNode?.name || ''}
        mode="rename"
        existingNodes={nodesToRender || []}
        currentFolderId={folderId || null}
        showToasts={showToasts}
      />

      {/* Unified Destructive Action Confirmation Overlay Popup */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        targetNode={deleteModal.targetNode}
        onClose={() => setDeleteModal({ isOpen: false, targetNode: null })}
        onConfirm={handleExecuteDelete}
        showToasts={showToasts}
      />

      {/* File Dropzone / Dialog Overlay */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        uploadProps={uploadProps}
        files={files}
        setFiles={setFiles}
        showToasts={showToasts}
      />

      {/* Hidden file input target intended for system file picker integrations */}
      <input type="file" className="opacity-0 fixed top-0 left-0" />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
    </>
  );
}
