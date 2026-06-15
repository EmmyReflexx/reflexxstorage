import { createStore } from '../Reflexx_Tools/reflexx-state';

/**
 * File Tree Application Store
 * Manages the core hierarchical directory structure for folders and asset nodes.
 */
export const fileTree = createStore(
  {
    files: [
      {
        id: '1',
        name: 'root',
        type: 'folder',
        children: [
          {
            id: '2',
            name: 'folder1',
            type: 'folder',
            children: [
              {
                id: '3',
                name: 'file1.txt',
                type: 'file',
                data: {
                  file: '',
                  size: '1.2 KB',
                  format: 'txt',
                  dateCreated: '',
                },
              },
            ],
          },
          {
            id: '4',
            name: 'file2.txt',
            type: 'file',
            data: {
              file: '',
              size: '2.5 KB',
              format: 'txt',
              dateCreated: '',
            },
          },
          {
            id: '5',
            name: 'file3.txt',
            type: 'file',
            data: {
              file: '',
              size: '0.8 KB',
              format: 'txt',
              dateCreated: '',
            },
          },
        ],
      },
      {
        id: '6',
        name: 'another-root-folder',
        type: 'folder',
        children: [
          {
            id: '7',
            name: 'notes.txt',
            type: 'file',
            data: {
              file: '',
              size: '1.5 KB',
              format: 'txt',
              dateCreated: '',
            },
          },
        ],
      },
      {
        id: '8',
        name: 'document.pdf',
        type: 'file',
        data: {
          file: '',
          size: '2.3 MB',
          format: 'pdf',
          dateCreated: '',
        },
      },
      {
        id: '9',
        name: 'photo.jpg',
        type: 'file',
        data: {
          file: '',
          size: '1.8 MB',
          format: 'jpg',
          dateCreated: '',
        },
      },
      {
        id: '10',
        name: 'presentation.pptx',
        type: 'file',
        data: {
          file: '',
          size: '5.7 MB',
          format: 'pptx',
          dateCreated: 'now',
        },
      },
      {
        id: '11',
        name: 'image.png',
        type: 'file',
        data: {
          file: '',
          size: '3.2 MB',
          format: 'png',
          dateCreated: 'now',
        },
      },
      {
        id: '12',
        name: 'video.mp4',
        type: 'file',
        data: {
          file: '',
          size: '45.2 MB',
          format: 'mp4',
          dateCreated: 'now',
        },
      },
    ],
  },
  {
    name: 'fileTree',
    persist: {
      key: 'fileTree',
      storage: 'indexedDB',
    },
  },
);
