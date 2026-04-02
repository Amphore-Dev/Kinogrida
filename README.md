# 📦 NPM Package Boilerplate

Un template moderne et complet pour créer des packages npm TypeScript avec des outils de développement préconfigurés.

## ✨ Fonctionnalités

- 🔷 **TypeScript** - Support complet avec configuration optimisée
- 🧪 **Tests** - Jest configuré avec coverage
- 📝 **Linting** - ESLint avec règles TypeScript
- 🎨 **Formatting** - Prettier intégré
- 📚 **Documentation** - Structure README ready-to-go
- 🔄 **CI/CD Ready** - Configuration prête pour l'intégration continue
- 💡 **Exemple d'usage** - Application React/Vite incluse
- 📦 **Build optimisé** - Configuration TypeScript pour la production

## 🚀 Démarrage rapide

### Installation

```bash
# Clonez ce repository
git clone https://github.com/amphore-dev/npm-package-boilerplate.git
cd npm-package-boilerplate

# Installez les dépendances
npm install
```

### Développement

```bash
# Build en mode watch
npm run build:watch

# Lancer les tests
npm test

# Tests en mode watch
npm run test:watch

# Coverage des tests
npm run test:coverage

# Linting
npm run lint

# Formatage du code
npm run format
```

## 📁 Structure du projet

```
├── src/                    # Code source principal
│   └── index.ts           # Point d'entrée du package
├── tests/                 # Tests unitaires
├── example/               # Application d'exemple
│   ├── src/               # Code source de l'exemple
│   └── package.json       # Dépendances de l'exemple
├── dist/                  # Build de production (généré)
├── package.json           # Configuration du package principal
├── tsconfig.json          # Configuration TypeScript
├── jest.config.json       # Configuration Jest
└── eslint.config.js       # Configuration ESLint
```

## 🎯 Utilisation

### Développer votre package

1. **Modifiez le package.json** avec vos informations :

    ```json
    {
        "name": "votre-package-name",
        "description": "Description de votre package",
        "author": "Votre nom",
        "repository": "https://github.com/username/repo"
    }
    ```

2. **Développez votre code dans `src/index.ts`** :

    ```typescript
    export const myFunction = (param: string): string => {
        return `Hello, ${param}!`;
    };
    ```

3. **Ajoutez des tests dans `tests/`** :

    ```typescript
    import { myFunction } from "../src/index";

    describe("myFunction", () => {
        it("should return greeting", () => {
            expect(myFunction("World")).toBe("Hello, World!");
        });
    });
    ```

### Tester avec l'exemple

L'application d'exemple utilise votre package via une dépendance locale :

```bash
# Naviguez vers l'exemple
cd example

# Installez les dépendances
npm install

# Lancez l'application de développement
npm run dev
```

Votre package sera disponible dans l'exemple via :

```typescript
import { myFunction } from "@amphore-dev/npm-package-template";
```

## 📜 Scripts disponibles

### Package principal

- `npm run build` - Build de production
- `npm run build:watch` - Build en mode watch
- `npm run test` - Lance tous les tests
- `npm run test:watch` - Tests en mode watch
- `npm run test:coverage` - Coverage des tests
- `npm run lint` - Vérification ESLint
- `npm run lint:fix` - Correction automatique ESLint
- `npm run format` - Formatage avec Prettier
- `npm run format:check` - Vérification du formatage

### Application d'exemple

- `npm run dev` - Serveur de développement Vite
- `npm run build` - Build de production
- `npm run preview` - Preview du build

## 🔧 Configuration

### TypeScript

Le projet utilise deux configurations TypeScript :

- `tsconfig.json` - Configuration principale
- `tsconfig.test.json` - Configuration pour les tests

### Jest

Configuration dans `jest.config.json` avec :

- Support TypeScript
- Coverage reporting
- Setup files configurés

### ESLint

Configuration moderne avec :

- Support TypeScript
- Règles recommandées
- Intégration Prettier

## 📚 Exemple d'usage

Voici comment votre package peut être utilisé une fois publié :

```bash
npm install votre-package-name
```

```typescript
import { myFunction } from "votre-package-name";

const result = myFunction("World");
console.log(result); // "Hello, World!"
```

## 🔄 Workflow de publication

1. **Développer et tester** votre code
2. **Mettre à jour la version** dans `package.json`
3. **Créer un build** : `npm run build`
4. **Publier** : `npm publish`

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📋 Checklist pour adapter ce template

- [ ] Modifiez `package.json` avec vos informations
- [ ] Mettez à jour ce README
- [ ] Implémentez votre code dans `src/`
- [ ] Ajoutez vos tests dans `tests/`
- [ ] Configurez votre repository Git
- [ ] Testez avec l'application d'exemple
- [ ] Configurez votre CI/CD

## 📄 License

MIT License - voir le fichier [LICENSE](LICENSE) pour les détails.

## 🙋‍♀️ Support

Si vous avez des questions ou des problèmes :

- 🐛 [Créez une issue](https://github.com/amphore-dev/npm-package-boilerplate/issues)
- 💬 [Discussions](https://github.com/amphore-dev/npm-package-boilerplate/discussions)

---
