"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { WindowState } from "../../types/windows"
import { getWindowStyle } from "../../utils/window-utils"

interface CmdWindowProps {
  windowState: WindowState
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onStartDragging: (e: React.MouseEvent) => void
}

// Virtual file system types
interface FileSystemItem {
  name: string
  type: "file" | "directory"
  content?: string
  size?: number
  children?: Record<string, FileSystemItem>
  createdAt: string
}

type FileSystem = Record<string, FileSystemItem>

export const CmdWindow: React.FC<CmdWindowProps> = ({
  windowState,
  isActive,
  onClose,
  onMinimize,
  onMaximize,
  onStartDragging,
}) => {
  const [commandHistory, setCommandHistory] = useState<string[]>([
    "Microsoft(R) Windows 98",
    "Copyright (C) 1981-1998 Microsoft Corp.",
    "",
    "C:\\>",
  ])
  const [currentCommand, setCurrentCommand] = useState("")
  const [commandIndex, setCommandIndex] = useState(-1)
  const [previousCommands, setPreviousCommands] = useState<string[]>([])
  const [currentDirectory, setCurrentDirectory] = useState("C:\\")
  const [fileSystem, setFileSystem] = useState<FileSystem>(() => initializeFileSystem())
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const cmdOutputRef = useRef<HTMLDivElement>(null)
  const cmdInputRef = useRef<HTMLInputElement>(null)

  // Initialize a basic file system
  function initializeFileSystem(): FileSystem {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })

    return {
      "C:\\": {
        name: "C:",
        type: "directory",
        createdAt: currentDate,
        children: {
          WINDOWS: {
            name: "WINDOWS",
            type: "directory",
            createdAt: currentDate,
            children: {
              SYSTEM: {
                name: "SYSTEM",
                type: "directory",
                createdAt: currentDate,
                children: {
                  "SYSTEM.INI": {
                    name: "SYSTEM.INI",
                    type: "file",
                    content: "; Windows 98 System Configuration\n[boot]\nsystem.drv=system.drv\n",
                    size: 512,
                    createdAt: currentDate,
                  },
                },
              },
              "WIN.INI": {
                name: "WIN.INI",
                type: "file",
                content: "; Windows 98 Configuration\n[windows]\nload=\nrun=\n",
                size: 384,
                createdAt: currentDate,
              },
            },
          },
          "PROGRAM FILES": {
            name: "PROGRAM FILES",
            type: "directory",
            createdAt: currentDate,
            children: {
              "INTERNET EXPLORER": {
                name: "INTERNET EXPLORER",
                type: "directory",
                createdAt: currentDate,
                children: {
                  "IEXPLORE.EXE": {
                    name: "IEXPLORE.EXE",
                    type: "file",
                    size: 1024,
                    createdAt: currentDate,
                  },
                },
              },
            },
          },
          "MY DOCUMENTS": {
            name: "MY DOCUMENTS",
            type: "directory",
            createdAt: currentDate,
            children: {
              "README.TXT": {
                name: "README.TXT",
                type: "file",
                content:
                  "This is my Windows 98 personal website.\nCreated with Next.js and styled to look like Windows 98.",
                size: 256,
                createdAt: currentDate,
              },
            },
          },
          PROJECTS: {
            name: "PROJECTS",
            type: "directory",
            createdAt: currentDate,
            children: {
              NIXOS: {
                name: "NIXOS",
                type: "directory",
                createdAt: currentDate,
                children: {
                  "CONFIG.NIX": {
                    name: "CONFIG.NIX",
                    type: "file",
                    content:
                      "{ config, pkgs, ... }:\n{\n  # NixOS configuration\n  imports = [ ./hardware-configuration.nix ];\n}",
                    size: 512,
                    createdAt: currentDate,
                  },
                },
              },
              LFS: {
                name: "LFS",
                type: "directory",
                createdAt: currentDate,
                children: {
                  "BUILD.SH": {
                    name: "BUILD.SH",
                    type: "file",
                    content: "#!/bin/bash\n# Linux From Scratch build script\necho 'Building LFS...'",
                    size: 384,
                    createdAt: currentDate,
                  },
                },
              },
            },
          },
          "AUTOEXEC.BAT": {
            name: "AUTOEXEC.BAT",
            type: "file",
            content: "@ECHO OFF\nPATH C:\\WINDOWS;C:\\WINDOWS\\COMMAND\nPROMPT $P$G",
            size: 384,
            createdAt: currentDate,
          },
          "CONFIG.SYS": {
            name: "CONFIG.SYS",
            type: "file",
            content: "DEVICE=C:\\WINDOWS\\HIMEM.SYS\nDOS=HIGH,UMB\nFILES=40",
            size: 512,
            createdAt: currentDate,
          },
        },
      },
    }
  }

  // Get the current directory object from the file system
  const getCurrentDirectoryObject = (): FileSystemItem | null => {
    try {
      const path = currentDirectory.split("\\").filter(Boolean)
      let current: FileSystemItem = fileSystem["C:\\"]

      if (path.length === 1 && path[0] === "C:") {
        return current
      }

      for (let i = 1; i < path.length; i++) {
        if (!current.children || !current.children[path[i]]) {
          return null
        }
        current = current.children[path[i]]
      }

      return current
    } catch (error) {
      return null
    }
  }

  // Resolve a path (absolute or relative) to an absolute path
  const resolvePath = (path: string): string => {
    // If already absolute
    if (path.includes(":\\")) {
      return path
    }

    // Handle current directory
    if (path === ".") {
      return currentDirectory
    }

    // Handle parent directory
    if (path === "..") {
      const parts = currentDirectory.split("\\").filter(Boolean)
      if (parts.length <= 1) {
        return "C:\\"
      }
      parts.pop()
      return parts.join("\\") + "\\"
    }

    // Handle relative path
    if (currentDirectory.endsWith("\\")) {
      return currentDirectory + path
    } else {
      return currentDirectory + "\\" + path
    }
  }

  // Get an item from the file system by path
  const getItemByPath = (path: string): FileSystemItem | null => {
    try {
      const absolutePath = resolvePath(path)
      const parts = absolutePath.split("\\").filter(Boolean)

      if (parts.length === 0) {
        return null
      }

      let current: FileSystemItem = fileSystem["C:\\"]

      if (parts.length === 1 && parts[0] === "C:") {
        return current
      }

      for (let i = 1; i < parts.length; i++) {
        if (!current.children || !current.children[parts[i]]) {
          return null
        }
        current = current.children[parts[i]]
      }

      return current
    } catch (error) {
      return null
    }
  }

  // Create a new file or directory in the file system
  const createItem = (path: string, type: "file" | "directory", content = ""): boolean => {
    try {
      const absolutePath = resolvePath(path)
      const parts = absolutePath.split("\\").filter(Boolean)

      if (parts.length <= 1) {
        return false
      }

      const itemName = parts[parts.length - 1]
      const parentPath = parts.slice(0, parts.length - 1).join("\\") + "\\"
      const parent = getItemByPath(parentPath)

      if (!parent || parent.type !== "directory" || !parent.children) {
        return false
      }

      // Check if item already exists
      if (parent.children[itemName]) {
        return false
      }

      // Create the new item
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })

      parent.children[itemName] = {
        name: itemName,
        type,
        createdAt: currentDate,
        ...(type === "file" ? { content, size: content.length } : { children: {} }),
      }

      // Update the file system
      setFileSystem({ ...fileSystem })

      return true
    } catch (error) {
      return false
    }
  }

  // Delete a file or directory from the file system
  const deleteItem = (path: string): boolean => {
    try {
      const absolutePath = resolvePath(path)
      const parts = absolutePath.split("\\").filter(Boolean)

      if (parts.length <= 1) {
        return false
      }

      const itemName = parts[parts.length - 1]
      const parentPath = parts.slice(0, parts.length - 1).join("\\") + "\\"
      const parent = getItemByPath(parentPath)

      if (!parent || parent.type !== "directory" || !parent.children) {
        return false
      }

      // Check if item exists
      if (!parent.children[itemName]) {
        return false
      }

      // Delete the item
      delete parent.children[itemName]

      // Update the file system
      setFileSystem({ ...fileSystem })

      return true
    } catch (error) {
      return false
    }
  }

  // ASCII Art Easter Eggs
  const asciiArt = {
    nyan: [
      "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░",
      "░░░░░░░░░░▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄░░░░░░░░░",
      "░░░░░░░░▄▀░░░░░░░░░░░░▄░░░░░░░▀▄░░░░░░░",
      "░░░░░░░░█░░▄░░░░▄░░░░░░░░░░░░░░█░░░░░░░",
      "░░░░░░░░█░░░░░░░░░░░░▄█▄▄░░▄░░░█░▄▄▄░░░",
      "░▄▄▄▄▄░░█░░░░░░▀░░░░▀█░░▀▄░░░░░█▀▀░██░░",
      "░██▄▀██▄█░░░▄░░░░░░░██░░░░▀▀▀▀▀░░░░██░░",
      "░░▀██▄▀██░░░░░░░░▀░██▀░░░░░░░░░░░░░▀██░",
      "░░░░▀████░▀░░░░▄░░░██░░░▄█░░░░▄░▄█░░██░",
      "░░░░░░░▀█░░░░▄░░░░░██░░░░▄░░░▄░░▄░░░██░",
      "░░░░░░░▄█▄░░░░░░░░░░░▀▄░░▀▀▀▀▀▀▀▀░░▄▀░░",
      "░░░░░░█▀▀█████████▀▀▀▀████████████▀░░░░",
      "░░░░░░████▀░░███▀░░░░░░▀███░░▀██▀░░░░░░",
      "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░",
    ],
    linux: [
      "         _nnnn_",
      "        dGGGGMMb",
      "       @p~qp~~qMb",
      "       M|@||@) M|",
      "       @,----.JM|",
      "      JS^\\__/  qKL",
      "     dZP        qKRb",
      "    dZP          qKKb",
      "   fZP            SMMb",
      "   HZM            MMMM",
      "   FqM            MMMM",
      ' __| ".        |\\dS"qML',
      " |    `.       | `' \\Zq",
      "_)      \\.___.,|     .'",
      "\\____   )MMMMMP|   .'",
      "     `-'       `--'",
    ],
    windows: [
      "        ,.=:!!t3Z3z.,",
      "       :tt:::tt333EE3",
      "       Et:::ztt33EEEL @Ee.,      ..,",
      "      ;tt:::tt333EE7 ;EEEEEEttttt33#",
      "     :Et:::zt333EEQ. $EEEEEttttt33QL",
      "     it::::tt333EEF @EEEEEEttttt33F",
      '    ;3=*^```"*4EEV :EEEEEEttttt33@.',
      "    ,.=::::!t=., ` @EEEEEEtttz33QF",
      '   ;::::::::zt33)   "4EEEtttji3P*',
      "  :t::::::::tt33.:Z3z..  `` ,..g.",
      "  i::::::::zt33F AEEEtttt::::ztF",
      " ;:::::::::t33V ;EEEttttt::::t3",
      " E::::::::zt33L @EEEtttt::::z3F",
      '{3=*^```"*4E3) ;EEEtttt:::::tZ`',
      "             ` :EEEEtttt::::z7",
      '                 "VEzjt:;;z>*`',
    ],
  }

  // Scroll to bottom when command history changes
  useEffect(() => {
    if (cmdOutputRef.current) {
      cmdOutputRef.current.scrollTop = cmdOutputRef.current.scrollHeight
    }
  }, [commandHistory])

  // Focus input when window is active
  useEffect(() => {
    if (isActive && cmdInputRef.current) {
      cmdInputRef.current.focus()
    }
  }, [isActive])

  // Load command history from localStorage
  useEffect(() => {
    const savedCommands = localStorage.getItem("cmdPreviousCommands")
    if (savedCommands) {
      try {
        setPreviousCommands(JSON.parse(savedCommands))
      } catch (e) {
        console.error("Failed to parse saved commands", e)
      }
    }
  }, [])

  // Save command history to localStorage
  useEffect(() => {
    if (previousCommands.length > 0) {
      localStorage.setItem("cmdPreviousCommands", JSON.stringify(previousCommands))
    }
  }, [previousCommands])

  const handleCommand = (command: string) => {
    // Add command to history
    const prompt = `${currentDirectory}>`
    const newHistory = [...commandHistory, `${prompt}${command}`]

    // Process command
    const cmd = command.trim().toLowerCase()
    const args = command.trim().split(/\s+/)
    const mainCommand = args[0].toLowerCase()

    if (cmd === "") {
      newHistory.push(prompt)
    } else if (mainCommand === "help") {
      newHistory.push("Available commands:")
      newHistory.push("  help     - Display this help message")
      newHistory.push("  cls      - Clear the screen")
      newHistory.push("  echo     - Display a message")
      newHistory.push("  dir      - List directory contents")
      newHistory.push("  cd       - Change directory")
      newHistory.push("  type     - Display file contents")
      newHistory.push("  mkdir    - Create a directory")
      newHistory.push("  rmdir    - Remove a directory")
      newHistory.push("  del      - Delete a file")
      newHistory.push("  copy     - Copy a file")
      newHistory.push("  edit     - Edit a file")
      newHistory.push("  color    - Change text color")
      newHistory.push("  ver      - Display Windows version")
      newHistory.push("  date     - Display current date")
      newHistory.push("  time     - Display current time")
      newHistory.push("  tree     - Display directory structure")
      newHistory.push("  ascii    - Display ASCII art (try: nyan, linux, windows)")
      newHistory.push("  exit     - Close the command prompt")
      newHistory.push("")
      newHistory.push(prompt)
    } else if (mainCommand === "cls") {
      setCommandHistory([prompt])
      return
    } else if (mainCommand === "echo") {
      const message = command.substring(5)
      if (message.trim()) {
        newHistory.push(message)
      } else {
        newHistory.push("ECHO is on.")
      }
      newHistory.push(prompt)
    } else if (mainCommand === "dir") {
      const targetPath = args.length > 1 ? args[1] : currentDirectory
      const dirObject = getItemByPath(targetPath)

      if (!dirObject || dirObject.type !== "directory") {
        newHistory.push(`The system cannot find the path specified: ${targetPath}`)
      } else {
        newHistory.push(` Volume in drive C has no label.`)
        newHistory.push(` Volume Serial Number is 1337-42069`)
        newHistory.push("")
        newHistory.push(` Directory of ${targetPath}`)
        newHistory.push("")

        let totalFiles = 0
        let totalDirs = 0
        let totalSize = 0

        if (dirObject.children) {
          // Add parent directory if not root
          if (targetPath !== "C:\\") {
            newHistory.push(`..          <DIR>        ${dirObject.createdAt}  ..`)
            totalDirs++
          }

          // Sort entries: directories first, then files, alphabetically
          const entries = Object.values(dirObject.children).sort((a, b) => {
            if (a.type !== b.type) {
              return a.type === "directory" ? -1 : 1
            }
            return a.name.localeCompare(b.name)
          })

          for (const entry of entries) {
            if (entry.type === "directory") {
              newHistory.push(`${entry.name.padEnd(12)} <DIR>        ${entry.createdAt}  ${entry.name}`)
              totalDirs++
            } else {
              const size = entry.size || 0
              newHistory.push(
                `${entry.name.padEnd(12)}        ${size.toString().padStart(8)} ${entry.createdAt}  ${entry.name}`,
              )
              totalFiles++
              totalSize += size
            }
          }
        }

        newHistory.push(`        ${totalFiles} file(s)      ${totalSize.toString().padStart(12)} bytes`)
        newHistory.push(`        ${totalDirs} dir(s)   1,073,741,824 bytes free`)
      }

      newHistory.push("")
      newHistory.push(prompt)
    } else if (mainCommand === "cd") {
      if (args.length === 1) {
        newHistory.push(currentDirectory)
      } else {
        const targetPath = args[1]

        // Handle special case for drive root
        if (targetPath === "C:" || targetPath === "C:\\") {
          setCurrentDirectory("C:\\")
        } else {
          const resolvedPath = resolvePath(targetPath)
          const targetDir = getItemByPath(resolvedPath)

          if (!targetDir) {
            newHistory.push(`The system cannot find the path specified: ${targetPath}`)
          } else if (targetDir.type !== "directory") {
            newHistory.push(`${targetPath} is not a directory.`)
          } else {
            // Ensure path ends with backslash
            let newPath = resolvedPath
            if (!newPath.endsWith("\\")) {
              newPath += "\\"
            }
            setCurrentDirectory(newPath)
          }
        }
      }

      newHistory.push(prompt)
    } else if (mainCommand === "type") {
      if (args.length < 2) {
        newHistory.push("Required parameter missing")
      } else {
        const filePath = args[1]
        const file = getItemByPath(filePath)

        if (!file) {
          newHistory.push(`The system cannot find the file specified: ${filePath}`)
        } else if (file.type !== "file") {
          newHistory.push(`Access is denied: ${filePath}`)
        } else {
          if (file.content) {
            // Split content by lines and add each line to history
            const lines = file.content.split("\n")
            for (const line of lines) {
              newHistory.push(line)
            }
          }
        }
      }

      newHistory.push(prompt)
    } else if (mainCommand === "mkdir" || mainCommand === "md") {
      if (args.length < 2) {
        newHistory.push("Required parameter missing")
      } else {
        const dirPath = args[1]
        const success = createItem(dirPath, "directory")

        if (!success) {
          newHistory.push(`Unable to create directory: ${dirPath}`)
        }
      }

      newHistory.push(prompt)
    } else if (mainCommand === "rmdir" || mainCommand === "rd") {
      if (args.length < 2) {
        newHistory.push("Required parameter missing")
      } else {
        const dirPath = args[1]
        const dir = getItemByPath(dirPath)

        if (!dir) {
          newHistory.push(`The system cannot find the path specified: ${dirPath}`)
        } else if (dir.type !== "directory") {
          newHistory.push(`${dirPath} is not a directory.`)
        } else if (dir.children && Object.keys(dir.children).length > 0) {
          newHistory.push(`The directory is not empty: ${dirPath}`)
        } else {
          const success = deleteItem(dirPath)
          if (!success) {
            newHistory.push(`Unable to remove directory: ${dirPath}`)
          }
        }
      }

      newHistory.push(prompt)
    } else if (mainCommand === "del" || mainCommand === "erase") {
      if (args.length < 2) {
        newHistory.push("Required parameter missing")
      } else {
        const filePath = args[1]
        const file = getItemByPath(filePath)

        if (!file) {
          newHistory.push(`The system cannot find the file specified: ${filePath}`)
        } else if (file.type !== "file") {
          newHistory.push(`Access is denied: ${filePath}`)
        } else {
          const success = deleteItem(filePath)
          if (!success) {
            newHistory.push(`Unable to delete file: ${filePath}`)
          }
        }
      }

      newHistory.push(prompt)
    } else if (mainCommand === "edit") {
      if (args.length < 2) {
        newHistory.push("Required parameter missing")
      } else {
        const filePath = args[1]
        const file = getItemByPath(filePath)

        if (file && file.type === "file") {
          // File exists, show content
          newHistory.push(`Editing file: ${filePath}`)
          newHistory.push("Type content below (end with CTRL+Z on a new line):")
          if (file.content) {
            const lines = file.content.split("\n")
            for (const line of lines) {
              newHistory.push(line)
            }
          }
        } else {
          // Create new file
          newHistory.push(`Creating new file: ${filePath}`)
          newHistory.push("Type content below (end with CTRL+Z on a new line):")
          createItem(filePath, "file", "")
        }

        // In a real editor, we'd enter edit mode here
        // For this simulation, we'll just acknowledge the command
        newHistory.push("")
        newHistory.push("(Edit mode not implemented in this simulation)")
      }

      newHistory.push(prompt)
    } else if (mainCommand === "copy") {
      if (args.length < 3) {
        newHistory.push("Required parameter missing")
      } else {
        const sourcePath = args[1]
        const destPath = args[2]
        const sourceFile = getItemByPath(sourcePath)

        if (!sourceFile) {
          newHistory.push(`The system cannot find the file specified: ${sourcePath}`)
        } else if (sourceFile.type !== "file") {
          newHistory.push(`Access is denied: ${sourcePath}`)
        } else {
          const content = sourceFile.content || ""
          const success = createItem(destPath, "file", content)

          if (success) {
            newHistory.push(`        1 file(s) copied.`)
          } else {
            newHistory.push(`Unable to copy file: ${sourcePath}`)
          }
        }
      }

      newHistory.push(prompt)
    } else if (mainCommand === "color") {
      if (args.length < 2) {
        // Reset color
        setSelectedColor(null)
        newHistory.push("Color reset to default.")
      } else {
        const colorCode = args[1].toLowerCase()
        let color = null

        switch (colorCode) {
          case "1":
            color = "#0000AA"
            break // Blue
          case "2":
            color = "#00AA00"
            break // Green
          case "3":
            color = "#00AAAA"
            break // Cyan
          case "4":
            color = "#AA0000"
            break // Red
          case "5":
            color = "#AA00AA"
            break // Magenta
          case "6":
            color = "#AA5500"
            break // Yellow/Brown
          case "7":
            color = "#AAAAAA"
            break // White
          case "8":
            color = "#555555"
            break // Gray
          case "9":
            color = "#5555FF"
            break // Bright Blue
          case "a":
            color = "#55FF55"
            break // Bright Green
          case "b":
            color = "#55FFFF"
            break // Bright Cyan
          case "c":
            color = "#FF5555"
            break // Bright Red
          case "d":
            color = "#FF55FF"
            break // Bright Magenta
          case "e":
            color = "#FFFF55"
            break // Bright Yellow
          case "f":
            color = "#FFFFFF"
            break // Bright White
          default:
            newHistory.push(`Invalid color code: ${colorCode}`)
        }

        if (color) {
          setSelectedColor(color)
          newHistory.push(`Color set to ${colorCode}.`)
        }
      }

      newHistory.push(prompt)
    } else if (mainCommand === "ver") {
      newHistory.push("Microsoft Windows [Version 4.10.1998]")
      newHistory.push("MS-DOS Version 7.10")
      newHistory.push(prompt)
    } else if (mainCommand === "date") {
      const today = new Date()
      newHistory.push(`Current date: ${today.toLocaleDateString()}`)
      newHistory.push(prompt)
    } else if (mainCommand === "time") {
      const now = new Date()
      newHistory.push(`Current time: ${now.toLocaleTimeString()}`)
      newHistory.push(prompt)
    } else if (mainCommand === "tree") {
      const targetPath = args.length > 1 ? args[1] : currentDirectory
      const rootDir = getItemByPath(targetPath)

      if (!rootDir || rootDir.type !== "directory") {
        newHistory.push(`The system cannot find the path specified: ${targetPath}`)
      } else {
        newHistory.push(`Folder PATH listing for volume C:`)
        newHistory.push(`Volume serial number is 1337-42069`)
        newHistory.push(targetPath)

        // Recursive function to print tree
        const printTree = (dir: FileSystemItem, prefix: string, isLast: boolean) => {
          if (!dir.children) return

          const entries = Object.values(dir.children).sort((a, b) => {
            if (a.type !== b.type) {
              return a.type === "directory" ? -1 : 1
            }
            return a.name.localeCompare(b.name)
          })

          for (let i = 0; i < entries.length; i++) {
            const entry = entries[i]
            const isLastEntry = i === entries.length - 1

            if (entry.type === "directory") {
              newHistory.push(`${prefix}${isLast ? "└───" : "├───"}${entry.name}`)
              printTree(entry, prefix + (isLast ? "    " : "│   "), isLastEntry)
            } else {
              newHistory.push(`${prefix}${isLast ? "└───" : "├───"}${entry.name}`)
            }
          }
        }

        printTree(rootDir, "", true)
      }

      newHistory.push(prompt)
    } else if (mainCommand === "ascii") {
      if (args.length < 2) {
        newHistory.push("Please specify which ASCII art to display (nyan, linux, windows)")
      } else {
        const artName = args[1].toLowerCase()
        if (asciiArt[artName as keyof typeof asciiArt]) {
          for (const line of asciiArt[artName as keyof typeof asciiArt]) {
            newHistory.push(line)
          }
        } else {
          newHistory.push(`ASCII art '${artName}' not found. Available options: nyan, linux, windows`)
        }
      }

      newHistory.push(prompt)
    } else if (mainCommand === "exit") {
      onClose()
      return
    } else {
      newHistory.push(`'${command}' is not recognized as an internal or external command,`)
      newHistory.push("operable program or batch file.")
      newHistory.push(prompt)
    }

    setCommandHistory(newHistory)

    // Add to previous commands for up/down navigation
    if (command.trim() !== "") {
      setPreviousCommands((prev) => [...prev, command])
    }

    setCurrentCommand("")
    setCommandIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(currentCommand)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (previousCommands.length > 0) {
        const newIndex = commandIndex < previousCommands.length - 1 ? commandIndex + 1 : commandIndex
        setCommandIndex(newIndex)
        setCurrentCommand(previousCommands[previousCommands.length - 1 - newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (commandIndex > 0) {
        const newIndex = commandIndex - 1
        setCommandIndex(newIndex)
        setCurrentCommand(previousCommands[previousCommands.length - 1 - newIndex])
      } else if (commandIndex === 0) {
        setCommandIndex(-1)
        setCurrentCommand("")
      }
    } else if (e.key === "Tab") {
      e.preventDefault()

      // Simple tab completion for commands and paths
      const input = currentCommand.trim()
      if (input === "") return

      const args = input.split(/\s+/)
      const newHistory = [...commandHistory]

      if (args.length === 1) {
        // Command completion
        const partialCommand = args[0].toLowerCase()
        const commands = [
          "help",
          "cls",
          "echo",
          "dir",
          "cd",
          "type",
          "mkdir",
          "rmdir",
          "del",
          "copy",
          "edit",
          "color",
          "ver",
          "date",
          "time",
          "tree",
          "ascii",
          "exit",
        ]

        const matches = commands.filter((cmd) => cmd.startsWith(partialCommand))

        if (matches.length === 1) {
          setCurrentCommand(matches[0])
        } else if (matches.length > 1) {
          newHistory.push(`${currentDirectory}>${input}`)
          for (const match of matches) {
            newHistory.push(match)
          }
          newHistory.push(`${currentDirectory}>`)
          setCommandHistory([...newHistory])
        }
      } else {
        // Path completion
        const lastArg = args[args.length - 1]

        if (lastArg.includes("\\") || lastArg.includes("/")) {
          // It's a path, try to complete it
          const dirPath = lastArg.substring(0, lastArg.lastIndexOf("\\") + 1) || currentDirectory
          const partialName = lastArg.substring(lastArg.lastIndexOf("\\") + 1).toLowerCase()

          const dir = getItemByPath(dirPath)

          if (dir && dir.type === "directory" && dir.children) {
            const matches = Object.values(dir.children)
              .filter((item) => item.name.toLowerCase().startsWith(partialName))
              .map((item) => item.name)

            if (matches.length === 1) {
              const newArgs = [...args]
              newArgs[newArgs.length - 1] = dirPath + matches[0]
              setCurrentCommand(newArgs.join(" "))
            } else if (matches.length > 1) {
              newHistory.push(`${currentDirectory}>${input}`)
              for (const match of matches) {
                newHistory.push(match)
              }
              newHistory.push(`${currentDirectory}>`)
              setCommandHistory([...newHistory])
            }
          }
        }
      }
    }
  }

  return (
    <div className="window" data-window="cmd" style={getWindowStyle("cmd", windowState, isActive)}>
      <div
        className="title-bar"
        onMouseDown={onStartDragging}
        style={{ cursor: windowState.isMaximized ? "default" : "move" }}
      >
        <div className="title-bar-text">Command Prompt</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize}></button>
          <button aria-label="Maximize" onClick={onMaximize}></button>
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>
      <div className="window-body cmd-container" onClick={() => cmdInputRef.current?.focus()} tabIndex={-1}>
        <div className="cmd-output" ref={cmdOutputRef} style={{ color: selectedColor || "#c0c0c0" }}>
          {commandHistory.map((line, index) => (
            <div key={index} className="cmd-line">
              {line}
            </div>
          ))}
          <div className="cmd-line cmd-current-line">
            <span>
              {currentDirectory}
              {">"}
            </span>
            <span>{currentCommand}</span>
            <span className="cmd-cursor">_</span>
          </div>
        </div>
        <input
          ref={cmdInputRef}
          type="text"
          className="cmd-hidden-input"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ color: selectedColor || "#c0c0c0" }}
          autoFocus
        />
      </div>
    </div>
  )
}
