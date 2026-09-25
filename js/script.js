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
        navMenu.querySelector('a')?.focus();
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
            link.addEventListener('click', () => {
                closeNavMenu();
                const target = link.hash ? document.querySelector(link.hash) : null;
                target?.focus({ preventScroll: true });
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('open')) {
                closeNavMenu();
                navToggle.focus();
            }
        });

        window.matchMedia(`(min-width: ${MOBILE_NAV_MAX + 1}px)`).addEventListener('change', (event) => {
            if (event.matches) {
                closeNavMenu();
            }
        });
    }

    // === BOTÃO VOLTAR AO TOPO ===
    const btnTopo = document.getElementById('btn-topo');

    if (btnTopo) {
        const toggleTopo = () => {
            btnTopo.hidden = window.scrollY < 400;
        };

        toggleTopo();
        window.addEventListener('scroll', toggleTopo, { passive: true });

        btnTopo.addEventListener('click', () => {
            window.scrollTo({ top: 0 });
            document.getElementById('home')?.focus({ preventScroll: true });
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
    const formFields = form ? [...form.querySelectorAll('input, select, textarea')] : [];
    const NAME_PATTERN = /^[\p{L}\p{M}]+(?:\s[\p{L}\p{M}]+)*$/u;
    const PHONE_PATTERN = /^\d+$/;

    const sanitizeField = (field) => {
        if (field.id === 'nome') {
            field.value = field.value.replace(/[^\p{L}\p{M} ]/gu, '');
        } else if (field.id === 'telefone') {
            field.value = field.value.replace(/\D/g, '').slice(0, 15);
        }
    };

    const restrictFieldInput = (field) => {
        const invalidInputPattern = field.id === 'nome'
            ? /[^\p{L}\p{M} ]/u
            : field.id === 'telefone'
                ? /\D/u
                : null;

        if (!invalidInputPattern) return;

        field.addEventListener('beforeinput', (event) => {
            if (event.inputType === 'insertFromPaste' || event.inputType === 'insertFromDrop') return;
            if (event.data && invalidInputPattern.test(event.data)) {
                event.preventDefault();
            }
        });
    };

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

    const getFieldError = (field) => document.getElementById(`${field.id}-error`);

    const clearFieldError = (field) => {
        field.setAttribute('aria-invalid', 'false');
        field.closest('.form-group')?.classList.remove('is-invalid');
        const error = getFieldError(field);
        if (error) error.textContent = '';
    };

    const setFieldError = (field, message) => {
        field.setAttribute('aria-invalid', 'true');
        field.closest('.form-group')?.classList.add('is-invalid');
        const error = getFieldError(field);
        if (error) error.textContent = message;
    };

    const validateField = (field) => {
        const value = field.value.trim();
        let message = '';

        if (!value) {
            message = {
                nome: 'Informe o seu nome.',
                telefone: 'Informe o telefone ou WhatsApp.',
                servico: 'Selecione o serviço desejado.',
                mensagem: 'Descreva brevemente o serviço necessário.',
            }[field.id] || 'Preencha este campo.';
        } else if (field.id === 'nome' && !NAME_PATTERN.test(value)) {
            message = 'Informe um nome com apenas letras e espaços.';
        } else if (field.id === 'telefone') {
            if (!PHONE_PATTERN.test(value)) {
                message = 'Informe somente números no telefone.';
            } else if (value.length < 10 || value.length > 15) {
                message = 'Informe um telefone com 10 a 15 dígitos.';
            }
        } else if (field.id === 'mensagem' && value.length < 10) {
            message = 'Descreva o serviço com pelo menos 10 caracteres.';
        }

        if (message) {
            setFieldError(field, message);
            return false;
        }

        clearFieldError(field);
        return true;
    };

    const clearFeedbackIfValid = () => {
        const hasErrors = formFields.some((field) => field.getAttribute('aria-invalid') === 'true');
        if (!hasErrors && formFeedback?.classList.contains('is-error')) {
            setFeedback('');
        }
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
        form.noValidate = true;
        formFields.forEach((field) => {
            restrictFieldInput(field);
            field.addEventListener('input', () => {
                sanitizeField(field);
                if (field.getAttribute('aria-invalid') === 'true') {
                    validateField(field);
                }
                if (formFeedback?.classList.contains('is-ok')) {
                    setFeedback('');
                }
                clearFeedbackIfValid();
            });

            field.addEventListener('blur', () => {
                validateField(field);
                clearFeedbackIfValid();
            });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            formFields.forEach(sanitizeField);
            formFields.forEach(clearFieldError);

            const invalidFields = formFields.filter((field) => !validateField(field));
            if (invalidFields.length) {
                setFeedback('Verifique os campos destacados antes de continuar.', 'is-error');
                invalidFields[0].focus();
                return;
            }

            const nome = form.nome.value.trim();
            const telefone = form.telefone.value.trim();
            const servicoSelect = form.servico;
            const mensagem = form.mensagem.value.trim();
            const canal = e.submitter?.getAttribute('data-canal') || 'whatsapp';
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
    }

    const galleryImages = document.querySelectorAll('.item-galeria img[data-source]');
    galleryImages.forEach((img) => {
        const fallback = img.dataset.source;
        const restoreSource = () => {
            if (fallback && img.getAttribute('src') !== fallback) {
                img.setAttribute('src', fallback);
            }
        };
        img.addEventListener('error', restoreSource, { once: true });
        if (img.complete && img.naturalWidth === 0) restoreSource();
    });

    // === MODAL DE IMAGENS ===
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const captionText = document.getElementById('modal-caption');
    const closeBtn = document.querySelector('.modal-close');
    const galleryButtons = document.querySelectorAll('.item-galeria-btn');
    let lastFocused = null;

    const FALLBACK_LABEL = 'Imagem ampliada do portfólio';

    const setBackgroundInert = (isInert) => {
        document.body.childNodes.forEach((node) => {
            if (node === modal || node.nodeType !== Node.ELEMENT_NODE) return;
            node.inert = isInert;
        });
    };

    const openModal = (img, opener) => {
        if (!modal || !modalImg || !captionText) return;
        lastFocused = opener instanceof HTMLElement ? opener : document.activeElement;
        modal.hidden = false;
        const fallback = img.dataset.source;
        const label = img.alt || FALLBACK_LABEL;
        modalImg.onerror = () => {
            if (fallback && modalImg.getAttribute('src') !== fallback) {
                modalImg.src = fallback;
            }
        };
        modalImg.onload = () => {
            if (modalImg.naturalWidth) {
                modalImg.width = modalImg.naturalWidth;
                modalImg.height = modalImg.naturalHeight;
            }
        };
        modalImg.src = img.dataset.full || img.src;
        modalImg.alt = label;
        captionText.textContent = label;
        document.body.classList.add('modal-open');
        setBackgroundInert(true);
        closeBtn?.focus();
    };

    const closeModal = () => {
        if (!modal) return;
        modal.hidden = true;
        modalImg.onerror = null;
        modalImg.onload = null;
        modalImg.removeAttribute('src');
        document.body.classList.remove('modal-open');
        setBackgroundInert(false);
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
            (el) => !el.disabled && !el.closest('[hidden]')
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
