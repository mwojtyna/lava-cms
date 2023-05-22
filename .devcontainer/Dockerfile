FROM mcr.microsoft.com/playwright:v1.34.0

WORKDIR /
SHELL ["/bin/bash", "-c"]

# Setup system
RUN apt-get update
RUN apt-get install -y neovim
RUN apt-get install -y less
RUN apt-get install -y psmisc
RUN apt-get install -y netcat
RUN apt-get install -y git
RUN apt-get install -y openssl
RUN apt-get install -y sudo
RUN apt-get install -y unzip

RUN ln -sf /usr/share/zoneinfo/Europe/Warsaw /etc/localtime
RUN echo "root:root" | chpasswd
RUN git config --global --add safe.directory /workspaces/lava-cms/

# Install node
ENV NODE_VERSION=18.16.0
ENV NVM_DIR=/home/pwuser/.nvm
RUN mkdir -p ${NVM_DIR}

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
RUN source ${NVM_DIR}/nvm.sh \
	&& nvm install ${NODE_VERSION} \
	&& nvm alias default ${NODE_VERSION} \
	&& nvm use default
ENV PATH ${NVM_DIR}/versions/node/v$NODE_VERSION/bin:$PATH

# Setup project
RUN npm install -g pnpm
RUN npm install -g git-open

# Install zsh
RUN apt-get install -y zsh
RUN usermod --shell /bin/zsh pwuser

# Install chezmoi
RUN sh -c "$(curl -fsLS get.chezmoi.io)"

# Setup volume mounts
RUN mkdir -p /workspaces/lava-cms/
RUN mkdir /home/pwuser/.vscode-server
RUN mkdir /home/pwuser/.pnpm-store

RUN chown -R pwuser:pwuser /workspaces/lava-cms/
RUN chown -R pwuser:pwuser /home/pwuser/.vscode-server
RUN chown -R pwuser:pwuser /home/pwuser/.pnpm-store

# Install oh-my-zsh
USER pwuser
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
