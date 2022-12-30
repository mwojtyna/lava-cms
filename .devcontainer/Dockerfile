FROM node:18.12.1

WORKDIR /

# Setup system
RUN apt-get update
RUN apt-get install neovim -y
RUN ln -sf /usr/share/zoneinfo/Europe/Warsaw /etc/localtime

# Setup project tools
RUN npm install -g pnpm
RUN npm install -g npm-upgrade
RUN npm install -g git-open

# Install zsh
RUN apt-get install zsh -y
RUN usermod --shell /bin/zsh node

# Install chezmoi
RUN sh -c "$(curl -fsLS get.chezmoi.io)"

# Install oh-my-zsh
USER node
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Apply dotfiles from repo
RUN chezmoi init https://github.com/matijas-05/dotfiles.git
RUN	chezmoi apply
RUN	chezmoi git switch zsh
RUN	chezmoi apply

# Install theme and plugins
RUN git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
RUN git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
RUN git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# Setup volume mounts
RUN mkdir /home/node/.vscode-server
RUN mkdir /home/node/.pnpm-store
