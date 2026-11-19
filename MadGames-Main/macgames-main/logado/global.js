/* ==========================================================================
   SCRIPT GLOBAL DA MAD GAMES
   Controla: Carrinho de Compras, Login no Menu, Redes Sociais e Cookies/LGPD
   ========================================================================== */

const MadGames = {
    // ---------- 1. UTILITÁRIOS DE ARMAZENAMENTO (localStorage) ----------
    getUsuarioLogado() {
        return JSON.parse(localStorage.getItem("madgames_usuario_logado") || "null");
    },

    getCarrinho() {
        return JSON.parse(localStorage.getItem("madgames_carrinho") || "[]");
    },

    salvarCarrinho(itens) {
        localStorage.setItem("madgames_carrinho", JSON.stringify(itens));
        this.atualizarBadgeCarrinho();
    },

    // ---------- 2. NOTIFICAÇÃO FLUTUANTE (TOAST) ----------
    mostrarToast(mensagem) {
        let toast = document.getElementById("toast-global");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "toast-global";
            toast.className = "toast-global oculto";
            document.body.appendChild(toast);
        }
        toast.textContent = mensagem;
        toast.classList.remove("oculto");
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => toast.classList.add("oculto"), 3000);
    },

    // ---------- 3. ADICIONAR ITEM AO CARRINHO ----------
    adicionarAoCarrinho(produto) {
        const carrinho = this.getCarrinho();
        const existente = carrinho.find((item) => item.id === produto.id);

        if (existente) {
            existente.qtd += 1;
        } else {
            carrinho.push({ ...produto, qtd: 1 });
        }

        this.salvarCarrinho(carrinho);
        this.mostrarToast(`"${produto.nome}" adicionado ao carrinho!`);
    },

    atualizarBadgeCarrinho() {
        const badge = document.getElementById("badge-carrinho");
        if (!badge) return;
        const totalQtd = this.getCarrinho().reduce((soma, item) => soma + item.qtd, 0);
        badge.textContent = totalQtd;
    },

    // ---------- 4. GAVETA LATERAL DO CARRINHO ----------
    abrirCarrinho() {
        let overlay = document.getElementById("carrinho-overlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.id = "carrinho-overlay";
            overlay.className = "carrinho-overlay";
            overlay.innerHTML = `
                <div class="carrinho-gaveta">
                    <div class="carrinho-topo">
                        <h2>Seu Carrinho</h2>
                        <button id="fechar-carrinho">&times;</button>
                    </div>
                    <div id="carrinho-lista" class="carrinho-lista"></div>
                    <div class="carrinho-rodape">
                        <div class="carrinho-total">
                            <span>Total:</span>
                            <span id="carrinho-total-valor">R$ 0,00</span>
                        </div>
                        <button id="btn-ir-checkout" class="btn-ir-checkout">Ir para Pré-Pagamento</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            overlay.addEventListener("click", (e) => {
                if (e.target === overlay) overlay.classList.add("oculto");
            });
            document.getElementById("fechar-carrinho").addEventListener("click", () => {
                overlay.classList.add("oculto");
            });
            document.getElementById("btn-ir-checkout").addEventListener("click", () => {
                if (this.getCarrinho().length === 0) {
                    this.mostrarToast("Seu carrinho está vazio!");
                    return;
                }
                const emInicio = window.location.pathname.includes("/inicio/");
                window.location.href = emInicio ? "checkout.html" : "../inicio/checkout.html";
            });
        }

        overlay.classList.remove("oculto");
        this.renderizarCarrinho();
    },

    renderizarCarrinho() {
        const lista = document.getElementById("carrinho-lista");
        const totalEl = document.getElementById("carrinho-total-valor");
        const carrinho = this.getCarrinho();

        if (carrinho.length === 0) {
            lista.innerHTML = `<p style="opacity:0.7; text-align:center; margin-top:40px;">Seu carrinho está vazio.</p>`;
            totalEl.textContent = "R$ 0,00";
            return;
        }

        let total = 0;
        lista.innerHTML = "";

        carrinho.forEach((item, index) => {
            total += item.preco * item.qtd;
            const div = document.createElement("div");
            div.className = "item-carrinho";
            div.innerHTML = `
                <img src="${item.imagem}" alt="${item.nome}">
                <div class="item-info">
                    <span>${item.nome}</span>
                    <strong>R$ ${(item.preco * item.qtd).toFixed(2).replace(".", ",")}</strong>
                </div>
                <div class="item-controles">
                    <button data-acao="menos" data-idx="${index}">-</button>
                    <span>${item.qtd}</span>
                    <button data-acao="mais" data-idx="${index}">+</button>
                    <button data-acao="remover" data-idx="${index}">✕</button>
                </div>
            `;
            lista.appendChild(div);
        });

        totalEl.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;

        lista.querySelectorAll("button").forEach((btn) => {
            btn.addEventListener("click", () => {
                const idx = Number(btn.dataset.idx);
                const acao = btn.dataset.acao;
                const atual = this.getCarrinho();

                if (acao === "mais") atual[idx].qtd += 1;
                if (acao === "menos") {
                    atual[idx].qtd -= 1;
                    if (atual[idx].qtd <= 0) atual.splice(idx, 1);
                }
                if (acao === "remover") atual.splice(idx, 1);

                this.salvarCarrinho(atual);
                this.renderizarCarrinho();
            });
        });
    },

    // ---------- 5. MENU DE USUÁRIO (REDIRECIONA PARA PERFIL SE LOGADO) ----------
    configurarMenuUsuario() {
        const usuario = this.getUsuarioLogado();
        const linkLogin = document.getElementById("link-login");
        const textoLogin = document.getElementById("texto-login");
        const fotoNav = document.querySelector(".foto-perfil");

        if (usuario && linkLogin && textoLogin) {
            textoLogin.textContent = usuario.nome;
            const emLogin = window.location.pathname.includes("/login/");
            linkLogin.href = emLogin ? "perfil.html" : "../login/perfil.html";
            if (usuario.foto && fotoNav) {
                fotoNav.src = usuario.foto;
            }
        }
    },

    // ---------- 6. REDES SOCIAIS (LINKS OFICIAIS) ----------
    configurarRedesSociais() {
        const links = {
            Discord: "https://discord.com",
            Facebook: "https://www.facebook.com",
            X: "https://x.com",
            YouTube: "https://www.youtube.com",
            Instagram: "https://www.instagram.com/madgamesdf/"
        };

        document.querySelectorAll(".logos1").forEach((el) => {
            el.addEventListener("click", () => {
                const rede = el.dataset.rede;
                if (links[rede]) {
                    window.open(links[rede], "_blank");
                }
            });
        });
    },

    // ---------- 7. BANNER DE COOKIES E POLÍTICA DE PRIVACIDADE (LGPD) ----------
    iniciarCookiesLGPD() {
        // MELHORIA: aparece apenas ao entrar no site e volta a aparecer após deslogar da conta
        if (localStorage.getItem("madgames_cookies_status")) return;

        const banner = document.createElement("div");
        banner.id = "banner-cookies";
        banner.className = "banner-cookies";
        banner.innerHTML = `
            <p>
                A <strong>MAD GAMES</strong> utiliza cookies essenciais para manter sua sessão, carrinho e segurança,
                em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>.
                <a id="abrir-lgpd">Ler Política de Privacidade e Segurança</a>.
            </p>
            <div class="cookies-acoes">
                <button id="recusar-cookies" class="btn-cookie-recusar">Apenas essenciais</button>
                <button id="aceitar-cookies" class="btn-cookie-aceitar">Aceitar todos</button>
            </div>
        `;
        document.body.appendChild(banner);

        document.getElementById("aceitar-cookies").addEventListener("click", () => {
            localStorage.setItem("madgames_cookies_status", "aceito");
            banner.remove();
            this.mostrarToast("Preferências de cookies salvas.");
        });

        document.getElementById("recusar-cookies").addEventListener("click", () => {
            localStorage.setItem("madgames_cookies_status", "essenciais");
            banner.remove();
            this.mostrarToast("Apenas cookies essenciais ativados.");
        });

        document.getElementById("abrir-lgpd").addEventListener("click", () => this.abrirModalLGPD());
    },

    abrirModalLGPD() {
        let modal = document.getElementById("lgpd-overlay");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "lgpd-overlay";
            modal.className = "lgpd-overlay";
            modal.innerHTML = `
                <div class="lgpd-box">
                    <h2>Política de Privacidade, Cookies e Segurança (LGPD)</h2>
                    <p>Este site (domínio <strong>MAD GAMES</strong>) segue as diretrizes da <strong>Lei nº 13.709/2018 (LGPD)</strong> e do Marco Civil da Internet (Lei nº 12.965/2014).</p>
                    <h4>1. Dados Coletados</h4>
                    <p>Coletamos apenas informações fornecidas voluntariamente (nome, e-mail, endereço e histórico de pedidos) armazenadas localmente para fins de funcionamento da loja e atendimento.</p>
                    <h4>2. Uso de Cookies</h4>
                    <p>Os cookies são utilizados para autenticação, preservação do carrinho de compras e preferências de navegação.</p>
                    <h4>3. Segurança e Direitos do Titular</h4>
                    <p>Você pode editar seus dados, ativar a verificação em 2 etapas ou apagar seu histórico a qualquer momento na área do seu Perfil.</p>
                    <button id="fechar-lgpd" class="btn-cookie-aceitar" style="margin-top:20px;">Entendi e Fechar</button>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById("fechar-lgpd").addEventListener("click", () => modal.classList.add("oculto"));
        }
        modal.classList.remove("oculto");
    },

    // ---------- INICIALIZAÇÃO AUTOMÁTICA ----------
    iniciar() {
        this.atualizarBadgeCarrinho();
        this.configurarMenuUsuario();
        this.configurarRedesSociais();
        this.iniciarCookiesLGPD();

        document.querySelectorAll(".link-rodape").forEach((link) => {
            if (link.textContent.toLowerCase().includes("privacidade")) {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.abrirModalLGPD();
                });
            }
        });

        const btnCarrinho = document.getElementById("btn-abrir-carrinho");
        if (btnCarrinho) {
            btnCarrinho.addEventListener("click", () => this.abrirCarrinho());
        }
    }
};

document.addEventListener("DOMContentLoaded", () => MadGames.iniciar());