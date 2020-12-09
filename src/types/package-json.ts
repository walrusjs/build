export interface PackageJson {
  name: string;
  version: string;
  source?: string;
  dependencies?: { [packageName: string]: string };
  devDependencies?: { [packageName: string]: string };
  engines?: {
    node?: string;
  };
  [key: string]: any;
}
