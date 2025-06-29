### Summary

This finance app is an electron-powered desktop application who allows its users to upload, label, explore, and export financial transactions. It includes automatic categorization of financial transactions based off rules as well as graphs to easily understand month-by-month financial activity. It supports importing financial documents from Chase and Wells Fargo.

### Setup

To get started, you may clone the repository and install yourself.

```
npm install
```

```
npm run start
```

### Packaging

To install as a desktop app you may run the following and run the installer.

```
npm run make
```

You can find the executable in the generated `/out` folder

### Publishing directly to releases

Set `GITHUB_TOKEN` with `repo:` permissions

```
export GITHUB_ACTIONS=XXXXXXX

set GITHUB_ACTIONS=XXXXXXX
```

Then publish

```
npm run publish
```

### New release via github actions

Update `package.json` with new version.

```
git tag v1.0.0
```

```
git push origin v1.0.0
```

### Update existing release (testing only)

```
git tag -d vX.X.X
```

```
git tag vX.X.X
```

```
git push --force origin vX.X.X
```