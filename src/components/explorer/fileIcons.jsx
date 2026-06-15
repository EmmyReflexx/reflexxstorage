import React from 'react';
// We pull specific, highly recognizable icons from various premium sets
import {
  FaFolder,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileArchive,
  FaFileAudio,
  FaFileAlt,
  FaMarkdown,
} from 'react-icons/fa';
import {
  BiLogoJavascript,
  BiLogoTypescript,
  BiLogoReact,
  BiLogoPython,
  BiLogoHtml5,
  BiLogoCss3,
  BiLogoJava,
} from 'react-icons/bi';
import {
  BsFillImageFill,
  BsFillPlayCircleFill,
  BsFillGearFill,
  BsBraces,
} from 'react-icons/bs';
import { DiDatabase } from 'react-icons/di';

/**
 * Custom Folder Icon
 */
export function FolderIcon({ size = 22, className = '' }) {
  // Using a nice filled folder icon
  return <FaFolder size={size} className={className} />;
}

/**
 * Extensive mapping of file extensions to specialized icons and colors.
 */
const ICON_MAPPING = {
  // Documents & Texts
  pdf: { icon: FaFilePdf, className: 'text-rose-500' },
  doc: { icon: FaFileWord, className: 'text-blue-500' },
  docx: { icon: FaFileWord, className: 'text-blue-500' },
  xls: { icon: FaFileExcel, className: 'text-emerald-600' },
  xlsx: { icon: FaFileExcel, className: 'text-emerald-600' },
  ppt: { icon: FaFilePowerpoint, className: 'text-orange-500' },
  pptx: { icon: FaFilePowerpoint, className: 'text-orange-500' },
  txt: { icon: FaFileAlt, className: 'text-slate-400' },
  md: { icon: FaMarkdown, className: 'text-sky-400' },

  // Programming / Web Development
  js: { icon: BiLogoJavascript, className: 'text-yellow-400' },
  jsx: { icon: BiLogoReact, className: 'text-cyan-400' },
  ts: { icon: BiLogoTypescript, className: 'text-blue-500' },
  tsx: { icon: BiLogoReact, className: 'text-cyan-400' },
  html: { icon: BiLogoHtml5, className: 'text-orange-600' },
  css: { icon: BiLogoCss3, className: 'text-blue-400' },
  py: { icon: BiLogoPython, className: 'text-amber-400' },
  java: { icon: BiLogoJava, className: 'text-red-400' },
  json: { icon: BsBraces, className: 'text-yellow-500' },
  sql: { icon: DiDatabase, className: 'text-cyan-600' },
  db: { icon: DiDatabase, className: 'text-indigo-400' },

  // Images
  png: { icon: BsFillImageFill, className: 'text-purple-400' },
  jpg: { icon: BsFillImageFill, className: 'text-purple-400' },
  jpeg: { icon: BsFillImageFill, className: 'text-purple-400' },
  gif: { icon: BsFillImageFill, className: 'text-pink-400' },
  svg: { icon: BsFillImageFill, className: 'text-orange-400' },
  webp: { icon: BsFillImageFill, className: 'text-fuchsia-400' },

  // Video & Audio
  mp4: { icon: BsFillPlayCircleFill, className: 'text-sky-400' },
  mkv: { icon: BsFillPlayCircleFill, className: 'text-sky-400' },
  mov: { icon: BsFillPlayCircleFill, className: 'text-sky-400' },
  avi: { icon: BsFillPlayCircleFill, className: 'text-sky-400' },
  mp3: { icon: FaFileAudio, className: 'text-teal-400' },
  wav: { icon: FaFileAudio, className: 'text-teal-400' },
  flac: { icon: FaFileAudio, className: 'text-teal-400' },

  // Archives
  zip: { icon: FaFileArchive, className: 'text-amber-600' },
  rar: { icon: FaFileArchive, className: 'text-amber-600' },
  tar: { icon: FaFileArchive, className: 'text-amber-600' },
  gz: { icon: FaFileArchive, className: 'text-amber-600' },

  // System / Config
  env: { icon: BsFillGearFill, className: 'text-emerald-400' },
  ini: { icon: BsFillGearFill, className: 'text-slate-400' },
  conf: { icon: BsFillGearFill, className: 'text-slate-400' },
};

/**
 * Resolves file format strings into customized React Icons.
 * Treats unrecognized formats with a fallback generic file icon.
 * * @param {string} format - The file extension/format (e.g., 'pdf', 'tsx')
 * @param {number} size - Icon size in pixels
 * @returns {JSX.Element} The rendered React Icon component
 */
export function getFileIcon(format, size = 22) {
  const cleanFormat = format ? format.toLowerCase().replace(/^\./, '') : '';
  const match = ICON_MAPPING[cleanFormat];

  if (match) {
    const IconComponent = match.icon;
    return <IconComponent size={size} className={match.className} />;
  }

  // Absolute fallback for unknown/other file types
  return <FaFileAlt size={size} className="text-text-muted opacity-80" />;
}
