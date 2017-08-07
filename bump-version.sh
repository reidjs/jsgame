#!/bin/bash
#https://stackoverflow.com/questions/19456518/invalid-command-code-despite-escaping-periods-using-sed
#https://stackoverflow.com/questions/8779951/how-do-i-run-a-shell-script-without-using-sh-or-bash-commands
#https://stackoverflow.com/questions/4181703/how-to-concatenate-string-variables-in-bash
#https://stackoverflow.com/questions/11145270/bash-replace-an-entire-line-in-a-text-file
a="JS GAME VERSION: "
b=$a$1
#sed -i '' '1s/.*/b/' README.md
sed -i '' "1s/.*/$b/" README.md
