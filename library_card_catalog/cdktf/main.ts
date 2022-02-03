import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { Database, Sequence, SnowflakeProvider, Table } from 'cdktf-dbt-snowflake';

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new SnowflakeProvider(this, "sysadmin", {
      account: "BVA60442",
      username: "tf-snow",
      role: "SYSADMIN",
      region: "us-west-2"
    });

    const db = new Database(this, "cdktf_test", {
      name: "LIBRARY_CARD_CATALOG",
      comment: "DWW Lesson 9"
    });

    // const schema = new Schema(this, "public_schema", {
    //   database: db.id,
    //   name: "PUBLIC"
    // });

    const authorTable = new Table(this, "author_table", {
      database: db.name,
      schema: "PUBLIC",
      name: "AUTHOR",
      // dependsOn: [db],
      column: [{
        name: "AUTHOR_UID",
        type: "NUMBER(38,0)"
      },{
        name: "FIRST_NAME",
        type: "VARCHAR(50)"
      },{
        name: "MIDDLE_NAME",
        type: "VARCHAR(50)"
      },{
        name: "LAST_NAME",
        type: "VARCHAR(50)"
      }]
    });

    new Sequence(this, "author-seq", {
      database: db.name,
      schema: "PUBLIC",
      name: "SEQ_AUTHOR_UID"
    });

    const bookSeq = new Sequence(this, "book-seq", {
      database: db.name,
      schema: "PUBLIC",
      name: "SEQ_BOOK_UID"
    });

    const bookTable = new Table(this, "book_table", {
      database: db.name,
      schema: "PUBLIC",
      name: "BOOK",
      dependsOn: [bookSeq],
      column: [{
        name: "BOOK_UID",
        type: "NUMBER(38,0)",
        default: {
          sequence: bookSeq.fullyQualifiedName
        }
      },{
        name: "TITLE",
        type: "VARCHAR(50)"
      },{
        name: "YEAR_PUBLISHED",
        type: "NUMBER(4,0)"
      }]
    });

    new Table(this, "book-to-author", {
      database: db.name,
      schema: "PUBLIC",
      name: "BOOK_TO_AUTHOR",
      dependsOn: [bookTable, authorTable],
      column: [{
        name: "BOOK_UID",
        type: "NUMBER(38,0)"
      },{
        name: "AUTHOR_UID",
        type: "NUMBER(38,0)"
      }]
    });
  }
}

const app = new App();
new MyStack(app, "library_card_catalog");
app.synth();
