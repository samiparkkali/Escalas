import reflex as rx
from reflex.plugins.sitemap import SitemapPlugin

config = rx.Config(
    app_name="app",
    db_url="sqlite:///reflex.db",
    plugins=[
        SitemapPlugin(),
    ],
)