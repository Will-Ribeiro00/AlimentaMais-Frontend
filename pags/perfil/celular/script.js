document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "phoneForm"
            );

        const currentPhone =
            document.getElementById(
                "currentPhone"
            );

        const newPhone =
            document.getElementById(
                "newPhone"
            );

        const message =
            document.getElementById(
                "message"
            );


        /* =====================================
           CARREGAR CELULAR ATUAL
        ====================================== */

        const data =
            loadData();


        const profile =
            data.profile ||
            {};


        currentPhone.value =
            profile.phone ||
            "";


        /* =====================================
           FORMATAÇÃO
        ====================================== */

        function formatPhone(
            value
        ) {

            const digits =
                String(value)
                    .replace(/\D/g, "")
                    .slice(0, 11);


            if (
                digits.length <= 2
            ) {

                return digits;

            }


            if (
                digits.length <= 7
            ) {

                return (
                    `(${digits.slice(0, 2)}) ` +
                    digits.slice(2)
                );

            }


            return (
                `(${digits.slice(0, 2)}) ` +
                digits.slice(2, 7) +
                "-" +
                digits.slice(7, 11)
            );

        }


        /* =====================================
           FORMATA ENQUANTO DIGITA
        ====================================== */

        newPhone.addEventListener(
            "input",
            () => {

                newPhone.value =
                    formatPhone(
                        newPhone.value
                    );

            }
        );


        /* =====================================
           MENSAGEM
        ====================================== */

        function clearMessage() {

            message.textContent =
                "";

            message.className =
                "message";

        }


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
           VALIDAÇÃO
        ====================================== */

        function isValidPhone(
            phone
        ) {

            const digits =
                String(phone)
                    .replace(/\D/g, "");


            /*
               Celular brasileiro:
               DDD + 9 dígitos
               Total: 11 números
            */

            return (
                digits.length === 11 &&
                digits.charAt(2) === "9"
            );

        }


        /* =====================================
           SALVAR
        ====================================== */

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                clearMessage();


                const value =
                    newPhone.value
                        .trim();


                const digits =
                    value.replace(
                        /\D/g,
                        ""
                    );


                if (!value) {

                    showMessage(
                        "Digite o novo celular.",
                        "error"
                    );

                    newPhone.focus();

                    return;

                }


                if (
                    !isValidPhone(
                        value
                    )
                ) {

                    showMessage(
                        "Digite um celular válido com DDD.",
                        "error"
                    );

                    newPhone.focus();

                    return;

                }


                const currentDigits =
                    String(
                        profile.phone ||
                        ""
                    ).replace(
                        /\D/g,
                        ""
                    );


                if (
                    digits ===
                    currentDigits
                ) {

                    showMessage(
                        "O novo celular precisa ser diferente do atual.",
                        "error"
                    );

                    newPhone.focus();

                    return;

                }


                /* =================================
                   ATUALIZA BANCO
                ================================== */

                data.profile =
                    data.profile ||
                    {};


                data.profile.phone =
                    formatPhone(
                        digits
                    );


                saveData(
                    data
                );


                /* =================================
                   ATUALIZA TELA
                ================================== */

                currentPhone.value =
                    data.profile.phone;


                newPhone.value =
                    "";


                showMessage(
                    "Celular alterado com sucesso!",
                    "success"
                );

            }
        );


        /* =====================================
           SINCRONIZAÇÃO
        ====================================== */

        window.addEventListener(
            DATA_EVENT,
            () => {

                const updatedData =
                    loadData();

                const updatedProfile =
                    updatedData.profile ||
                    {};


                currentPhone.value =
                    updatedProfile.phone ||
                    "";

            }
        );

    }
);