document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "passwordForm"
            );

        const currentPassword =
            document.getElementById(
                "currentPassword"
            );

        const newPassword =
            document.getElementById(
                "newPassword"
            );

        const confirmPassword =
            document.getElementById(
                "confirmPassword"
            );

        const message =
            document.getElementById(
                "message"
            );


        /* =====================================
           MOSTRAR / OCULTAR SENHA
        ====================================== */

        document
            .querySelectorAll(".show-password")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const targetId =
                            button.dataset.target;

                        const input =
                            document.getElementById(
                                targetId
                            );

                        if (!input) {
                            return;
                        }

                        const icon =
                            button.querySelector("i");


                        if (
                            input.type ===
                            "password"
                        ) {

                            input.type =
                                "text";

                            icon.className =
                                "fa-regular fa-eye-slash";

                        } else {

                            input.type =
                                "password";

                            icon.className =
                                "fa-regular fa-eye";

                        }

                    }
                );

            });


        /* =====================================
           LIMPAR MENSAGEM
        ====================================== */

        function clearMessage() {

            message.textContent = "";

            message.className =
                "message";

        }


        /* =====================================
           MENSAGEM
        ====================================== */

        function showMessage(
            text,
            type
        ) {

            message.textContent =
                text;

            message.className =
                `message ${type}`;

        }


        /* =====================================
           SALVAR
        ====================================== */

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                clearMessage();


                const current =
                    currentPassword
                        .value
                        .trim();

                const newPass =
                    newPassword
                        .value;

                const confirm =
                    confirmPassword
                        .value;


                /* Dados atuais */

                const data =
                    loadData();


                const profile =
                    data.profile ||
                    {};

                const savedPassword =
                    profile.password ||
                    "123456";


                /* =================================
                   VALIDAÇÕES
                ================================== */

                if (!current) {

                    showMessage(
                        "Digite sua senha atual.",
                        "error"
                    );

                    currentPassword.focus();

                    return;

                }


                if (
                    current !==
                    savedPassword
                ) {

                    showMessage(
                        "A senha atual está incorreta.",
                        "error"
                    );

                    currentPassword.focus();

                    return;

                }


                if (
                    newPass.length < 6
                ) {

                    showMessage(
                        "A nova senha deve ter pelo menos 6 caracteres.",
                        "error"
                    );

                    newPassword.focus();

                    return;

                }


                if (
                    newPass !==
                    confirm
                ) {

                    showMessage(
                        "A confirmação da nova senha não confere.",
                        "error"
                    );

                    confirmPassword.focus();

                    return;

                }


                if (
                    newPass ===
                    current
                ) {

                    showMessage(
                        "A nova senha deve ser diferente da senha atual.",
                        "error"
                    );

                    newPassword.focus();

                    return;

                }


                /* =================================
                   SALVAR NO BANCO
                ================================== */

                data.profile =
                    data.profile ||
                    {};

                data.profile.password =
                    newPass;


                saveData(
                    data
                );


                /* =================================
                   SUCESSO
                ================================== */

                showMessage(
                    "Senha alterada com sucesso!",
                    "success"
                );


                form.reset();


            }
        );

    }
);