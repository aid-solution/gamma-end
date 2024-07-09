import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ConvertToOriginalTypePipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, metadata: ArgumentMetadata) {
    const result = {};
    return this.processObject(value, result);
  }

  private checkValue(input: any): any {
    let change: any;
    if (input === 'Oui' || input === 'Non') {
      change = input === 'Oui' ? true : false;
    } else if (!isNaN(input) && input !== '') {
      change = +input;
    } else {
      change = input;
    }
    return change;
  }

  private processObject(obj: any, res: any): any {
    Object.keys(obj).forEach((key) => {
      if (obj[key] !== '') {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          res[key] = {};
          this.processObject(obj[key], res[key]);
        } else if (Array.isArray(obj[key])) {
          res[key] = obj[key].map((item) => {
            if (typeof item === 'object') {
              const newItem = {};
              this.processObject(item, newItem);
              return newItem;
            }
            return this.checkValue(item);
          });
        } else {
          res[key] = this.checkValue(obj[key]);
        }
      }
    });
    return res;
  }
}
