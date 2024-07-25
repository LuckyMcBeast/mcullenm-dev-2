# Building Linux From Scratch
##### 09-05-2022

Last week, I decided to go through the process of building Linux From Scratch on a physical machine. At first this might seem like a rather daunting task, but in the end it was actually pretty straightforward. Linux From Scratch, or LFS, is a guide to building a minimal GNU/Linux operating system by compiling each application from a source tarball. This requires that you know how to execute basic terminal commands and have a working system with a POSIX compliant shell (e.g., bash, zsh, dash) to start the process. I used a bootable USB that had a GUI environment and a web browser to make the process a bit easier. The first step is to partition the disk you want to install LFS on and then create a cross-compiler which contains the tools necessary to compile the packages on the disk. After you have that set up, you mount the disk and change the apparent root (chroot) of the host environment to that disk's root directory, where you compile all the necessary packages for the OS, until finally, you configure your kernel and reboot into your shiny new system.

For the most part, the process went pretty smoothly, however, I did run into an issue when I ignored some of failing tests for my newly assembled C compiler (GCC) and had to do a bit of backtracking when other packages started failing to build. In my defense, I was told that quite a few tests would fail, just not as many as actually did. I believe the cause of the unexpected failures was my computer going to sleep during the process, but I'm not really sure if the machine actually went to sleep or the display simply powered off. Regardless, after recompiling the compiler (a statement which makes me chuckle) I was able to proceed just fine. I also had some trouble at the end when I forgot to install the NVMe module into the kernel while using an NVMe drive for my root system, which prevented my installation from booting at all. This was also a fairly simple to fix by recompiling the kernel with that module, though it took some serious time to figure out why the kernel was panicking.

I configured my system to use UEFI instead of the older BIOS boot process by following the EFI guide in Beyond Linux From Scratch. If you go through this process and you want to use EFI instead of BIOS (you probably do, if you are reading this), it's important to take the necessary partitioning steps before you start the rest of the process. Depending on your initial configuration, having to repartition in the middle could be problematic and result in having to start over.

It took me a few days to complete the process in my spare time (total time was probably close to 8 or 9 hours) and was a bit of tedious. Unzip tarball, cd into new directory, make, make check, make install, cd out of the directory, delete directory, repeat for the next app. To shorten the amount and length of the commands I needed to type, I created a few variables and aliases which saved some time:

```bash
export LFS=/mnt/lfs
```
Suggested in the LFS Guide, references the directory where you mounted the root partition of LFS on the host system (absolutely do this). I also did this for my other partitions, BOOT and HOME.

```bash
alias wgetL='wget --directory-prefix=$LFS/sources'
```
For downloading to the tarballs to the sources directory. I also suggest creating a wget list, that way you only have to run it once for the main packages. I mainly used this for other tools that I wanted to add from BLFS, like git and the UEFI tools, which aren't in LFS by default.

```bash
alias rmD='rm -rvf'
```
Removes a directory that contains files verbosely and forcefully.

```bash
alias rmCD='cd .. && rmD $OLDPWD'
```
Changes directory to the parent of the working directory and then removes the previous working directory.

```bash
alias tarS='tar -xvf'
```
Extracts content from a tarball and places it’s content in a directory verbosely.

From this project, I believe I have a much more intimate understanding of Linux-based systems, how they work at a lower level, how they are structured, and the core tools used within them. Would I daily drive my LFS operating system? No, probably not; largely because it lacks a modern package manager and that little bit of convenience goes a long way. However, in the future, I aspire to create my own “ideal” Linux distribution with its own set of core tools (including a package manager) that is not based on any other distribution, unlike the hundreds of Arch and Debian based distributions out there. I believe building LFS puts me a few steps closer to doing just that.

#### References:
- [https://linuxfromscratch.org/lfs/view/stable/](https://linuxfromscratch.org/lfs/view/stable/)