const sidebar =
    document.getElementById("sidebar");

const mobileMenu =
    document.getElementById("mobileMenu");

const overlay =
    document.getElementById("overlay");

const currentDate =
    document.getElementById("currentDate");

const offerForm =
    document.getElementById("offerForm");

const offersTableBody =
    document.getElementById(
        "offersTableBody"
    );

const mobileOffers =
    document.getElementById(
        "mobileOffers"
    );

const offerCount =
    document.getElementById(
        "offerCount"
    );

const pickupTime =
    document.getElementById(
        "pickupTime"
    );

const timeError =
    document.getElementById(
        "timeError"
    );


/* MODAL */

const stockModal =
    document.getElementById(
        "stockModal"
    );

const closeStockModalButton =
    document.getElementById(
        "closeStockModal"
    );

const cancelStock =
    document.getElementById(
        "cancelStock"
    );

const saveStock =
    document.getElementById(
        "saveStock"
    );

const newStock =
    document.getElementById(
        "newStock"
    );

const selectedOfferName =
    document.getElementById(
        "selectedOfferName"
    );


let selectedOfferId = null;


/* =========================================================
   DATA
========================================================= */

currentDate.textContent =
    getTodayBR();


/* =========================================================
   MENU MOBILE
========================================================= */

mobileMenu.addEventListener(
    "click",
    () => {

        const open =
            sidebar.classList.toggle(
                "open"
            );


        overlay.classList.toggle(
            "active",
            open
        );


        mobileMenu.setAttribute(
            "aria-expanded",
            String(open)
        );

    }
);


overlay.addEventListener(
    "click",
    closeMenu
);


function closeMenu() {

    sidebar.classList.remove(
        "open"
    );


    overlay.classList.remove(
        "active"
    );


    mobileMenu.setAttribute(
        "aria-expanded",
        "false"
    );

}


/* =========================================================
   HORÁRIO
========================================================= */

pickupTime.addEventListener(
    "input",
    () => {

        pickupTime.value =
            normalizeTime(
                pickupTime.value
            );


        if (
            pickupTime.value.length === 5 &&
            !isTimeValid(
                pickupTime.value
            )
        ) {

            timeError.textContent =
                "Horário inválido. Use entre 00:00 e 23:59.";

        } else {

            timeError.textContent =
                "";

        }

    }
);


/* =========================================================
   STATUS OFERTA
========================================================= */

function statusClass(
    offer
) {

    if (
        !offer.active
    ) {

        return "inactive";

    }


    if (
        Number(
            offer.quantity
        ) <= 0
    ) {

        return "empty";

    }


    return "available";

}


function statusText(
    offer
) {

    if (
        !offer.active
    ) {

        return "Inativa";

    }


    if (
        Number(
            offer.quantity
        ) <= 0
    ) {

        return "Esgotada";

    }


    return "Disponível";

}


/* =========================================================
   RENDERIZAR
========================================================= */

function renderOffers() {

    const data =
        loadData();


    offerCount.textContent =
        `${data.offers.length} ${
            data.offers.length === 1
                ? "oferta"
                : "ofertas"
        }`;


    offersTableBody.innerHTML =
        data.offers.map(
            offer => `

                <tr>

                    <td>
                        ${escapeHTML(
                            offer.name
                        )}
                    </td>


                    <td>
                        ${Number(
                            offer.quantity
                        )}
                    </td>


                    <td>
                        ${getTodayBR()}
                    </td>


                    <td>
                        ${formatCurrency(
                            offer.offerPrice
                        )}
                    </td>


                    <td>

                        <span
                            class="
                                status
                                ${statusClass(
                                    offer
                                )}
                            "
                        >
                            ${statusText(
                                offer
                            )}
                        </span>

                    </td>


                    <td>

                        <div class="offer-actions">

                            <button
                                class="action-button"
                                type="button"
                                data-menu-id="${offer.id}"
                                aria-expanded="false"
                                aria-label="Abrir opções"
                            >

                                <i
                                    class="fa-solid fa-bars"
                                ></i>

                            </button>


                            <div
                                class="action-menu"
                            >

                                <button
                                    type="button"
                                    data-action="stock"
                                    data-id="${offer.id}"
                                >

                                    <i
                                        class="fa-solid fa-box"
                                    ></i>

                                    Alterar estoque

                                </button>


                                <button
                                    type="button"
                                    class="delete"
                                    data-action="delete"
                                    data-id="${offer.id}"
                                >

                                    <i
                                        class="fa-solid fa-trash"
                                    ></i>

                                    Excluir oferta

                                </button>


                                <button
                                    type="button"
                                    data-action="inactive"
                                    data-id="${offer.id}"
                                >

                                    <i
                                        class="fa-solid fa-power-off"
                                    ></i>

                                    ${
                                        offer.active
                                            ? "Inativar oferta"
                                            : "Ativar oferta"
                                    }

                                </button>

                            </div>

                        </div>

                    </td>

                </tr>

            `
        ).join("");


    mobileOffers.innerHTML =
        data.offers.map(
            offer => `

                <article
                    class="mobile-offer"
                >

                    <div>

                        <div
                            class="mobile-offer-name"
                        >

                            ${escapeHTML(
                                offer.name
                            )}

                        </div>


                        <div
                            class="mobile-meta"
                        >

                            <div>

                                <span>
                                    Quantidade
                                </span>

                                <strong>
                                    ${Number(
                                        offer.quantity
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Preço
                                </span>

                                <strong>
                                    ${formatCurrency(
                                        offer.offerPrice
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Status
                                </span>

                                <strong>

                                    <span
                                        class="
                                            status
                                            ${statusClass(
                                                offer
                                            )}
                                        "
                                    >
                                        ${statusText(
                                            offer
                                        )}
                                    </span>

                                </strong>

                            </div>


                            <div>

                                <span>
                                    Retirada
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        offer.pickup
                                    )}
                                </strong>

                            </div>

                        </div>

                    </div>


                    <div
                        class="offer-actions"
                    >

                        <button
                            class="action-button"
                            type="button"
                            data-menu-id="${offer.id}"
                        >

                            <i
                                class="fa-solid fa-bars"
                            ></i>

                        </button>


                        <div
                            class="action-menu"
                        >

                            <button
                                type="button"
                                data-action="stock"
                                data-id="${offer.id}"
                            >
                                Alterar estoque
                            </button>


                            <button
                                type="button"
                                class="delete"
                                data-action="delete"
                                data-id="${offer.id}"
                            >
                                Excluir oferta
                            </button>


                            <button
                                type="button"
                                data-action="inactive"
                                data-id="${offer.id}"
                            >
                                ${
                                    offer.active
                                        ? "Inativar oferta"
                                        : "Ativar oferta"
                                }
                            </button>

                        </div>

                    </div>

                </article>

            `
        ).join("");

}


/* =========================================================
   MENU DE AÇÕES
========================================================= */

document.addEventListener(
    "click",
    event => {

        const menuButton =
            event.target.closest(
                "[data-menu-id]"
            );


        if (menuButton) {

            event.stopPropagation();


            document
                .querySelectorAll(
                    ".action-menu"
                )
                .forEach(
                    menu =>
                        menu.classList.remove(
                            "open"
                        )
                );


            const parent =
                menuButton.closest(
                    ".offer-actions"
                );


            const menu =
                parent.querySelector(
                    ".action-menu"
                );


            menu.classList.add(
                "open"
            );


            return;

        }


        const actionButton =
            event.target.closest(
                "[data-action]"
            );


        if (!actionButton) {
            return;
        }


        document
            .querySelectorAll(
                ".action-menu"
            )
            .forEach(
                menu =>
                    menu.classList.remove(
                        "open"
                    )
            );


        const id =
            actionButton.dataset.id;


        const action =
            actionButton.dataset.action;


        if (
            action === "stock"
        ) {

            openStockModal(
                id
            );

        }


        if (
            action === "delete"
        ) {

            deleteOffer(
                id
            );

        }


        if (
            action === "inactive"
        ) {

            toggleOfferActive(
                id
            );

        }

    }
);


/* =========================================================
   PUBLICAR
========================================================= */

offerForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const name =
            document
                .getElementById(
                    "offerName"
                )
                .value
                .trim();


        const description =
            document
                .getElementById(
                    "offerDescription"
                )
                .value
                .trim();


        const originalPrice =
            Number(
                document
                    .getElementById(
                        "originalPrice"
                    )
                    .value
            );


        const offerPrice =
            Number(
                document
                    .getElementById(
                        "offerPrice"
                    )
                    .value
            );


        const quantity =
            Number(
                document
                    .getElementById(
                        "offerStock"
                    )
                    .value
            );


        const category =
            document
                .getElementById(
                    "offerCategory"
                )
                .value;


        const pickup =
            normalizeTime(
                pickupTime.value
            );


        const estimatedKgPerUnit =
            Number(
                document
                    .getElementById(
                        "offerKg"
                    )
                    .value
            );


        if (
            name.length < 2
        ) {

            document
                .getElementById(
                    "offerNameError"
                )
                .textContent =
                "Digite um nome válido.";

            return;

        }


        if (
            !Number.isFinite(
                originalPrice
            ) ||
            originalPrice < 0
        ) {

            alert(
                "Informe um preço original válido."
            );

            return;

        }


        if (
            !Number.isFinite(
                offerPrice
            ) ||
            offerPrice < 0 ||
            offerPrice >
                originalPrice
        ) {

            alert(
                "O preço da oferta é inválido."
            );

            return;

        }


        if (
            !Number.isInteger(
                quantity
            ) ||
            quantity < 0
        ) {

            alert(
                "Digite uma quantidade válida."
            );

            return;

        }


        if (
            !isTimeValid(
                pickup
            )
        ) {

            timeError.textContent =
                "Horário inválido. Use HH:MM entre 00:00 e 23:59.";

            pickupTime.focus();

            return;

        }


        if (
            !Number.isFinite(
                estimatedKgPerUnit
            ) ||
            estimatedKgPerUnit < 0
        ) {

            alert(
                "Informe um peso válido."
            );

            return;

        }


        const data =
            loadData();


        const offer = {

            id:
                generateId("o_"),

            name,

            description,

            originalPrice,

            offerPrice,

            quantity,

            category,

            pickup,

            active:
                true,

            estimatedKgPerUnit,

            createdAt:
                new Date().toISOString()

        };


        data.offers.unshift(
            offer
        );


        saveData(
            data
        );


        offerForm.reset();


        document
            .getElementById(
                "offerKg"
            )
            .value =
            "0.30";


        timeError.textContent =
            "";


        renderOffers();


        alert(
            `Oferta "${offer.name}" publicada com sucesso.`
        );

    }
);


/* =========================================================
   ESTOQUE
========================================================= */

function openStockModal(
    id
) {

    const data =
        loadData();


    const offer =
        getOfferById(
            data,
            id
        );


    if (!offer) {
        return;
    }


    selectedOfferId =
        id;


    selectedOfferName.textContent =
        offer.name;


    newStock.value =
        offer.quantity;


    stockModal.classList.add(
        "active"
    );


    setTimeout(
        () =>
            newStock.focus(),
        100
    );

}


function closeStockDialog() {

    stockModal.classList.remove(
        "active"
    );


    selectedOfferId =
        null;

}


closeStockModalButton.addEventListener(
    "click",
    closeStockDialog
);


cancelStock.addEventListener(
    "click",
    closeStockDialog
);


stockModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            stockModal
        ) {

            closeStockDialog();

        }

    }
);


saveStock.addEventListener(
    "click",
    () => {

        if (
            selectedOfferId ===
            null
        ) {

            return;

        }


        const quantity =
            Number(
                newStock.value
            );


        if (
            !Number.isInteger(
                quantity
            ) ||
            quantity < 0
        ) {

            alert(
                "Informe uma quantidade inteira válida."
            );

            return;

        }


        const data =
            loadData();


        const offer =
            getOfferById(
                data,
                selectedOfferId
            );


        if (!offer) {
            return;
        }


        offer.quantity =
            quantity;


        saveData(
            data
        );


        renderOffers();


        closeStockDialog();

    }
);


/* =========================================================
   EXCLUIR
========================================================= */

function deleteOffer(
    id
) {

    const data =
        loadData();


    const offer =
        getOfferById(
            data,
            id
        );


    if (!offer) {
        return;
    }


    const hasActiveReservations =
        data.reservations.some(
            reservation =>
                String(
                    reservation.offerId
                ) ===
                String(id) &&
                reservationIsActive(
                    reservation
                )
        );


    if (
        hasActiveReservations
    ) {

        alert(
            "Não é possível excluir uma oferta com reservas ativas."
        );

        return;

    }


    if (
        !confirm(
            `Excluir a oferta "${offer.name}"?`
        )
    ) {

        return;

    }


    data.offers =
        data.offers.filter(
            item =>
                String(item.id) !==
                String(id)
        );


    saveData(
        data
    );


    renderOffers();

}


/* =========================================================
   ATIVAR / INATIVAR
========================================================= */

function toggleOfferActive(
    id
) {

    const data =
        loadData();


    const offer =
        getOfferById(
            data,
            id
        );


    if (!offer) {
        return;
    }


    offer.active =
        !offer.active;


    saveData(
        data
    );


    renderOffers();

}


/* =========================================================
   SINCRONIZAÇÃO
========================================================= */

window.addEventListener(
    DATA_EVENT,
    renderOffers
);


window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth > 750
        ) {

            closeMenu();

        }

    }
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeStockDialog();

            closeMenu();

        }

    }
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

renderOffers();