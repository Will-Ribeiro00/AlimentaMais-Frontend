/* =========================================================
   BANCO COMPARTILHADO - PADARIA SÃO JOÃO
========================================================= */

const STORAGE_KEY = "padariaSaoJoaoData";
const DATA_EVENT = "padariaDataChanged";


/* =========================================================
   DADOS PADRÃO
========================================================= */

const DEFAULT_DATA = {

    /* =====================================================
       PERFIL
    ====================================================== */

    profile: {

    profile: {

    responsibleName: "Luciana da Silva",

    cpf: "123.456.678-09",

    cnpj: "12.345.678/0001-95",

    password: "123456",

    email: "atendimento@padariasaaojoao.com.br",

    phone: "(11) 94378-0192",

    fantasyName: "Padaria São João Panificadora LTDA",

    address: "Av. Paulista, 156, São Paulo - SP, 01310-000",

    category: "Padaria"
}

    },


    /* =====================================================
       OFERTAS
    ====================================================== */

    offers: [

        {
            id: 1,

            name:
                "Kit Padaria",

            description:
                "Pães e itens variados do dia.",

            originalPrice:
                13.00,

            offerPrice:
                8.99,

            quantity:
                5,

            category:
                "Padaria",

            pickup:
                "20:30",

            active:
                true,

            estimatedKgPerUnit:
                0.40
        },


        {
            id: 2,

            name:
                "Salgados",

            description:
                "Seleção de salgados frescos.",

            originalPrice:
                15.00,

            offerPrice:
                9.99,

            quantity:
                8,

            category:
                "Salgados",

            pickup:
                "19:30",

            active:
                true,

            estimatedKgPerUnit:
                0.25
        }

    ],


    /* =====================================================
       RESERVAS
    ====================================================== */

    reservations: [

        {
            id: 1,

            offerId: 1,

            offerName:
                "Kit Padaria",

            customerName:
                "João Lucas",

            reservationDate:
                "28/09/2026",

            createdAt:
                "2026-09-28T09:00:00-03:00",

            code:
                "HE782B",

            quantity:
                1,

            status:
                "Aguardando retirada"

        },


        {
            id: 2,

            offerId: 1,

            offerName:
                "Kit Padaria",

            customerName:
                "Pedro Henrique",

            reservationDate:
                "28/09/2026",

            createdAt:
                "2026-09-28T08:30:00-03:00",

            code:
                "NVP417",

            quantity:
                1,

            status:
                "Retirada"

        },


        {
            id: 3,

            offerId: 1,

            offerName:
                "Kit Padaria",

            customerName:
                "Marcos Vinicius",

            reservationDate:
                "27/09/2026",

            createdAt:
                "2026-09-27T10:15:00-03:00",

            code:
                "LM643M",

            quantity:
                1,

            status:
                "Cancelada"

        },


        {
            id: 4,

            offerId: 2,

            offerName:
                "Salgados",

            customerName:
                "Maria Clara",

            reservationDate:
                "28/09/2026",

            createdAt:
                "2026-09-28T11:20:00-03:00",

            code:
                "AB349F",

            quantity:
                2,

            status:
                "Aguardando retirada"

        }

    ]

};


/* =========================================================
   FUNÇÕES BÁSICAS
========================================================= */

function deepClone(value) {

    return JSON.parse(
        JSON.stringify(value)
    );

}


/* =========================================================
   EVENTO DE ALTERAÇÃO
========================================================= */

function emitDataChange() {

    window.dispatchEvent(
        new CustomEvent(DATA_EVENT)
    );

}


/* =========================================================
   CARREGAR DADOS
========================================================= */

function loadData() {

    const raw =
        localStorage.getItem(
            STORAGE_KEY
        );


    /*
       Primeiro acesso:
       cria o banco completo.
    */

    if (!raw) {

        const initial =
            deepClone(
                DEFAULT_DATA
            );


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(initial)
        );


        return initial;

    }


    try {

        const data =
            JSON.parse(raw);


        /*
           Mantém os dados que já existem
           e adiciona o perfil caso ainda
           não exista.
        */

        return {

            profile:
                data.profile ||
                deepClone(
                    DEFAULT_DATA.profile
                ),


            offers:
                Array.isArray(data.offers)
                    ? data.offers
                    : deepClone(
                        DEFAULT_DATA.offers
                    ),


            reservations:
                Array.isArray(data.reservations)
                    ? data.reservations
                    : deepClone(
                        DEFAULT_DATA.reservations
                    )

        };

    } catch (error) {

        console.error(
            "Erro ao carregar dados:",
            error
        );


        const initial =
            deepClone(
                DEFAULT_DATA
            );


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(initial)
        );


        return initial;

    }

}


/* =========================================================
   SALVAR DADOS
========================================================= */

function saveData(data) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );


    emitDataChange();

}


/* =========================================================
   RESETAR BANCO
========================================================= */

function resetData() {

    const initial =
        deepClone(
            DEFAULT_DATA
        );


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(initial)
    );


    emitDataChange();


    return initial;

}


/* =========================================================
   DATA
========================================================= */

function getTodayISO() {

    const now =
        new Date();


    return new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone:
                "America/Sao_Paulo",

            year:
                "numeric",

            month:
                "2-digit",

            day:
                "2-digit"
        }

    ).format(now);

}


function getTodayBR() {

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            timeZone:
                "America/Sao_Paulo",

            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric"
        }

    ).format(
        new Date()
    );

}


/* =========================================================
   CONVERSÃO DE DATA
========================================================= */

function formatDateBRToISO(brDate) {

    const parts =
        String(brDate)
            .split("/");


    if (
        parts.length !== 3
    ) {

        return "";

    }


    const [
        day,
        month,
        year
    ] = parts;


    return `${year}-${month}-${day}`;

}


function formatISOToBR(isoDate) {

    const parts =
        String(isoDate)
            .split("-");


    if (
        parts.length !== 3
    ) {

        return "";

    }


    const [
        year,
        month,
        day
    ] = parts;


    return `${day}/${month}/${year}`;

}


/* =========================================================
   MOEDA
========================================================= */

function formatCurrency(value) {

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style:
                "currency",

            currency:
                "BRL"
        }

    ).format(
        Number(value) || 0
    );

}


/* =========================================================
   DATA E HORA
========================================================= */

function formatDateTimeBR(
    isoString
) {

    if (
        !isoString
    ) {

        return "-";

    }


    const date =
        new Date(
            isoString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            timeZone:
                "America/Sao_Paulo",

            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric"
        }

    ).format(
        date
    );

}


/* =========================================================
   ID
========================================================= */

function generateId(
    prefix = ""
) {

    return (
        prefix +
        Date.now() +
        Math.random()
            .toString(36)
            .slice(2, 7)
    );

}


/* =========================================================
   CÓDIGO DA RESERVA
========================================================= */

function generateReservationCode(
    data
) {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let code;


    do {

        code = "";


        for (
            let i = 0;
            i < 6;
            i++
        ) {

            code +=
                chars[
                    Math.floor(
                        Math.random() *
                        chars.length
                    )
                ];

        }


    } while (

        data.reservations.some(
            reservation =>
                reservation.code ===
                code
        )

    );


    return code;

}


/* =========================================================
   HORÁRIO
========================================================= */

function isTimeValid(
    value
) {

    const match =
        /^(\d{2}):(\d{2})$/.exec(
            String(value).trim()
        );


    if (!match) {

        return false;

    }


    const hours =
        Number(
            match[1]
        );


    const minutes =
        Number(
            match[2]
        );


    return (
        hours >= 0 &&
        hours <= 23 &&
        minutes >= 0 &&
        minutes <= 59
    );

}


function normalizeTime(
    value
) {

    let digits =
        String(value)
            .replace(
                /\D/g,
                ""
            )
            .slice(
                0,
                4
            );


    if (
        digits.length === 4
    ) {

        return (
            digits.slice(
                0,
                2
            ) +
            ":" +
            digits.slice(
                2
            )
        );

    }


    return String(
        value
    ).trim();

}


/* =========================================================
   BUSCAS
========================================================= */

function getOfferById(
    data,
    id
) {

    return (

        data.offers.find(
            offer =>
                String(
                    offer.id
                ) ===
                String(
                    id
                )
        ) ||

        null

    );

}


function getReservationById(
    data,
    id
) {

    return (

        data.reservations.find(
            reservation =>
                String(
                    reservation.id
                ) ===
                String(
                    id
                )
        ) ||

        null

    );

}


/* =========================================================
   PERFIL
========================================================= */

function getProfile(
    data
) {

    return (
        data.profile ||
        deepClone(
            DEFAULT_DATA.profile
        )
    );

}


/* =========================================================
   OFERTAS DISPONÍVEIS
========================================================= */

function getActiveOffers(
    data
) {

    return data.offers.filter(
        offer =>
            Boolean(
                offer.active
            ) &&

            Number(
                offer.quantity
            ) > 0
    );

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   STATUS ATIVO
========================================================= */

function reservationIsActive(
    reservation
) {

    return (
        reservation.status !==
        "Cancelada"
    );

}


/* =========================================================
   SINCRONIZAÇÃO ENTRE ABAS
========================================================= */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key ===
            STORAGE_KEY
        ) {

            emitDataChange();

        }

    }
);