---
title: "Your first Plugin"
---

A plugin is how you extend the Cat. It's a folder of Python files that can contain `Agents`, `Tools`, `Directives`, `Hooks` and `Endpoints`. You don't distribute these pieces directly, you distribute a Plugin containing them. Don't worry, we'll explore each one in the upcoming steps. For now, let's start by creating an empty plugin.

## Creating the Plugin

To create a plugin just create a new subfolder in directory `plugins/`, for our first plugin the folder name will be `poetic_sock_seller`.

Your plugin folder lives under `plugins/` in the project:

```
my-cat
├── config.py            # optional installation config
├── data/                # database, uploads, memory
├── plugins
│   └── poetic_sock_seller
│       ├── plugin.json
│       └── poetic_sock_seller.py
└── pyproject.toml
```

The `plugin.json` file contains the plugin's title and description, and is useful in the Admin Portal to recognize the plugin and activate/deactivate it. It is optional but recommended.

`plugin.json` example:

```json
{
    "name": "Poetic Sock Seller",
    "description": "Description of poetic_sock_seller"
}
```

The `poetic_sock_seller.py` file will contain our agent and its tools. It can be left completely empty for this step.

## Activating the Plugin

Now, go to the `Plugin` tab of the Admin Portal.
Your empty plugin will be there, activate it:

![Alt text](../assets/img/quickstart/prepare-plugin/activate-plugins.png)

#### More Info

Here the plugins reference: [`Plugins`](/docs/plugins/plugins/)

If you plan to publish your plugin, also take a look at this [`Plugins → Registry`](/docs/plugins/plugins-registry/plugin-from-template/)
