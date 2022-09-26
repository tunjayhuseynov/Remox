import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html>
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin={"anonymous"} />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
                <meta name="description" content="Remox - Simplified and Collaborative Treasury  Management for DAOs" key="desc" />
                <meta property="og:title" content="Remox - Simplified and Collaborative Treasury  Management for DAOs" />
                <link rel="icon" href="/icons/companies/remox.png" />
                <meta
                    property="og:image"
                    content="/icons/remox.png"
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}