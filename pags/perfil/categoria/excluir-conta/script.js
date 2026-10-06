document.addEventListener(
    "DOMContentLoaded",
    () => {

        const deleteButton =
            document.getElementById(
                "deleteButton"
            );

        const confirmDelete =
            document.getElementById(
                "confirmDelete"
            );

        const deleteModal =
            document.getElementById(
                "deleteModal"
            );

        const closeModal =
            document.getElementById(
                "closeModal"
            );

        const cancelDelete =
            document.getElementById(
                "cancelDelete"
            );

        const deletePassword =
            document.getElementById(
                "deletePassword"
            );

        const togglePassword =
            document.getElementById(
                "togglePassword"
            );

        const modalConfirm =
            document.getElementById(
                "modalConfirm"
            );

        const confirmDeleteButton =
            document.getElementById(
                "confirmDeleteButton"
            );

        const modalMessage =
            document.getElementById(
                "modalMessage"
            );


        /* =====================================
           ATIVAR / DESATIVAR BOTÃO PRINCIPAL
        ====================================== */

        function updateDeleteButton() {

            deleteButton.disabled =
                !confirmDelete.checked;

        }


        confirmDelete.addEventListener(
            "change",
            updateDeleteButton
        );


        updateDeleteButton();


        /* =====================================
           ABRIR MODAL
        ====================================== */

        deleteButton.addEventListener(
            "click",
            () => {

                if (
                    !confirmDelete.checked
                ) {

                    return;

                }

                deletePassword.value =
                    "";

                modalConfirm.checked =
                    false;

                modalMessage.textContent =
                    "";

                modalMessage.className =
                    "modal-message";


                deleteModal.classList.add(
                    "active"
                );


                deleteModal.setAttribute(
                    "aria-hidden",
                    "false"
                );


                setTimeout(
                    () => {
                        deletePassword.focus();
                    },
                    50
                );

            }
        );


        /* =====================================
           FECHAR MODAL
        ====================================== */

        function closeDeleteModal() {

            deleteModal.classList.remove(
                "active"
            );

            deleteModal.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        closeModal.addEventListener(
            "click",
            closeDeleteModal
        );


        cancelDelete.addEventListener(
            "click",
            closeDeleteModal
        );


        /* =====================================
           CLICAR FORA DO MODAL
        ====================================== */

        deleteModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    deleteModal
                ) {

                    closeDeleteModal();

                }

            }
        );


        /* =====================================
           ESC
        ====================================== */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape" &&
                    deleteModal.classList.contains(
                        "active"
                    )
                ) {

                    closeDeleteModal();

                }

            }
        );


        /* =====================================
           MOSTRAR SENHA
        ====================================== */

        togglePassword.addEventListener(
            "click",
            () => {

                const icon =
                    togglePassword.querySelector(
                        "i"
                    );


                if (
                    deletePassword.type ===
                    "password"
                ) {

                    deletePassword.type =
                        "text";

                    icon.className =
                        "fa-regular fa-eye-slash";

                    togglePassword.setAttribute(
                        "aria-label",
                        "Ocultar senha"
                    );

                } else {

                    deletePassword.type =
                        "password";

                    icon.className =
                        "fa-regular fa-eye";

                    togglePassword.setAttribute(
                        "aria-label",
                        "Mostrar senha"
                    );

                }

            }
        );


        /* =====================================
           LIMPAR MENSAGEM
        ====================================== */

        function clearMessage() {

            modalMessage.textContent =
                "";

            modalMessage.className =
                "modal-message";

        }


        function showError(
            text
        ) {

            modalMessage.textContent =
                text;

            modalMessage.className =
                "modal-message error";

        }


        /* =====================================
           CONFIRMAR EXCLUSÃO
        ====================================== */

        confirmDeleteButton.addEventListener(
            "click",
            () => {

                clearMessage();


                /* ==============================
                   SENHA
                ============================== */

                const password =
                    deletePassword.value;


                if (!password) {

                    showError(
                        "Digite sua senha para continuar."
                    );

                    deletePassword.focus();

                    return;

                }


                /* ==============================
                   CHECKBOX
                ============================== */

                if (
                    !modalConfirm.checked
                ) {

                    showError(
                        "Confirme que deseja excluir sua conta."
                    );

                    return;

                }


                /* ==============================
                   BANCO
                ============================== */

                const data =
                    loadData();


                const savedPassword =
                    data.profile?.password ||
                    "123456";


                if (
                    password !==
                    savedPassword
                ) {

                    showError(
                        "Senha incorreta."
                    );

                    deletePassword.focus();

                    return;

                }


                /* ==============================
                   EXCLUSÃO
                ============================== */

                localStorage.removeItem(
                    "padariaSaoJoaoData"
                );


                closeDeleteModal();


                /*
                   Após a exclusão,
                   volta para o início.
                */

                document.body.innerHTML = `

                    <div class="deleted-screen">

                        <div class="deleted-content">

                            <div class="deleted-icon">

                                <i class="fa-solid fa-check"></i>

                            </div>

                            <h1>
                                Conta excluída
                            </h1>

                            <p>
                                Sua conta foi excluída com sucesso.
                            </p>

                        </div>

                    </div>

                `;


                setTimeout(
                    () => {

                        window.location.href =
                            "../../dashboard/index.html";

                    },
                    1800
                );

            }
        );

    }
);