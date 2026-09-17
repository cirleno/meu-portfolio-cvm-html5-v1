document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.remove('no-js');

    const KEY = 'XMarcalTec2026';
    const decodeContact = (b64) => {
        const bin = atob(b64);
        let out = '';
        for (let i = 0; i < bin.length; i += 2) {
            const code = bin.charCodeAt(i) | (bin.charCodeAt(i + 1) << 8);
            out += String.fromCharCode(code ^ KEY.charCodeAt((i / 2) % KEY.length));
        }
        return out;
    };

    document.querySelectorAll('[data-contact]').forEach((el) => {
        el.href = decodeContact(el.dataset.contact);
    });

    const WHATSAPP_NUMBER = decodeContact('bQB4AFUAQwBaAFgAXgBsAFQAWgAKAAEAAgA=');

    // === MENU MOBILE ===
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navOverlay = document.getElementById('nav-overlay');
    const MOBILE_NAV_MAX = 768;

    const closeNavMenu = () => {
        if (!navMenu || !navToggle) return;
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Abrir menu');
        document.body.classList.remove('nav-open');
    };

    const openNavMenu = () => {
        if (!navMenu || !navToggle) return;
        navMenu.classList.add('open');
        navToggle.setAttribute('aria-expanded', 'true');
        navToggle.setAttribute('aria-label', 'Fechar menu');
        document.body.classList.add('nav-open');
    };

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.contains('open');
            if (isOpen) {
                closeNavMenu();
            } else {
                openNavMenu();
            }
        });

        navOverlay?.addEventListener('click', closeNavMenu);

        navMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', closeNavMenu);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('open')) {
                closeNavMenu();
                navToggle.focus();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > MOBILE_NAV_MAX) {
                closeNavMenu();
            }
        });
    }

    // === FILTRO DA GALERIA ===
    const filterButtons = document.querySelectorAll('.btn-filtro');
    const galleryItems = document.querySelectorAll('.item-galeria');

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            filterButtons.forEach((btn) => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-pressed', 'true');

            const filterValue = button.getAttribute('data-filter');

            galleryItems.forEach((item) => {
                const show = filterValue === 'todos' || item.classList.contains(filterValue);
                item.style.display = show ? 'block' : 'none';
            });
        });
    });

    // === FORMULÁRIO → WHATSAPP OU E-MAIL ===
    const form = document.getElementById('formContato');
    const formFeedback = document.getElementById('formFeedback');
    const CONTACT_EMAIL = decodeContact('OwAkABMAHgAGAA8AAwAUAAoAFgBGAFwAXQBZADMAYwACAB0ADgBPAA4AJgA=');

    const abrirExterno = (url) => {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const setFeedback = (message, type) => {
        if (!formFeedback) return;
        formFeedback.textContent = message;
        formFeedback.classList.remove('is-error', 'is-ok');
        if (type) {
            formFeedback.classList.add(type);
        }
    };

    const limparErros = () => {
        form.querySelectorAll('.form-group.is-invalid').forEach((group) => {
            group.classList.remove('is-invalid');
        });
    };

    const marcarErro = (field) => {
        field.closest('.form-group')?.classList.add('is-invalid');
    };

    const montarTexto = (nome, telefone, servicoLabel, mensagem) => [
        'Olá! Gostaria de solicitar um orçamento.',
        '',
        `Nome: ${nome}`,
        `Telefone: ${telefone}`,
        `Serviço: ${servicoLabel}`,
        '',
        mensagem,
    ].join('\n');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            limparErros();

            const nome = form.nome.value.trim();
            const telefone = form.telefone.value.trim();
            const servicoSelect = form.servico;
            const mensagem = form.mensagem.value.trim();
            const canal = e.submitter?.getAttribute('data-canal') || 'whatsapp';

            if (!nome) {
                marcarErro(form.nome);
                setFeedback('Informe o seu nome.', 'is-error');
                form.nome.focus();
                return;
            }

            if (!telefone) {
                marcarErro(form.telefone);
                setFeedback('Informe o telefone ou WhatsApp.', 'is-error');
                form.telefone.focus();
                return;
            }

            if (!servicoSelect.value) {
                marcarErro(servicoSelect);
                setFeedback('Selecione o serviço desejado.', 'is-error');
                servicoSelect.focus();
                return;
            }

            if (!mensagem) {
                marcarErro(form.mensagem);
                setFeedback('Descreva brevemente o serviço necessário.', 'is-error');
                form.mensagem.focus();
                return;
            }

            const servicoLabel = servicoSelect.options[servicoSelect.selectedIndex].text;
            const texto = montarTexto(nome, telefone, servicoLabel, mensagem);

            if (canal === 'email') {
                const assunto = `Orçamento — ${servicoLabel} — ${nome}`;
                const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(texto)}`;
                abrirExterno(url);
                setFeedback('Abrindo seu aplicativo de e-mail com a mensagem pronta.', 'is-ok');
                return;
            }

            const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;
            abrirExterno(url);
            setFeedback('Abrindo o WhatsApp com a sua solicitação.', 'is-ok');
        });

        form.querySelectorAll('input, select, textarea').forEach((field) => {
            field.addEventListener('input', () => {
                field.closest('.form-group')?.classList.remove('is-invalid');
                if (formFeedback?.classList.contains('is-error')) {
                    setFeedback('');
                }
            });
        });
    }

    // === MODAL DE IMAGENS ===
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const captionText = document.getElementById('modal-caption');
    const closeBtn = document.querySelector('.modal-close');
    const galleryButtons = document.querySelectorAll('.item-galeria-btn');
    let lastFocused = null;

    const openModal = (img, opener) => {
        if (!modal || !modalImg || !captionText) return;
        lastFocused = opener instanceof HTMLElement ? opener : document.activeElement;
        modal.hidden = false;
        modalImg.src = img.src;
        modalImg.alt = img.alt || 'Imagem ampliada do portfólio';
        captionText.textContent = img.alt || '';
        document.body.classList.add('modal-open');
        closeBtn?.focus();
    };

    const closeModal = () => {
        if (!modal) return;
        modal.hidden = true;
        modalImg.src = '';
        document.body.classList.remove('modal-open');
        if (lastFocused && document.contains(lastFocused)) {
            lastFocused.focus();
        }
    };

    galleryButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const img = btn.querySelector('img');
            if (img) openModal(img, btn);
        });
    });

    const FOCUSABLE_SELECTOR =
        'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

    const getModalFocusable = () => {
        if (!modal) return [];
        return [...modal.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
            (el) => el.offsetParent !== null
        );
    };

    modal?.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab' || modal.hidden) return;
        const focusables = getModalFocusable();
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });

    closeBtn?.addEventListener('click', closeModal);

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.hidden) {
            closeModal();
        }
    });
});
