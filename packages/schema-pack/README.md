# Schema Pack

This is an extended version of MessagePack... TODO: complete main description

## Type system

* Types
    * **KeyShape**: a unique key of an object with the shape ids of the object in which this key appears. A KeyShape is a tuple of a key and a set of unique shape ids.
    * TODO: complete description of the type system

## Formats

### Overview

format name     | first byte (in binary) | first byte (in hex) | first byte (in decimal)
--------------- | ---------------------- | ------------------- | -----------------------
fixshapemap     | 1000XXXX               | 0x80 - 0x8f         | 128 - 143
uarray          | 11011100               | 0xdc                | 220
schema          | 11011101               | 0xdd                | 221
shapemap        | 11011110               | 0xde                | 222
break           | 11011111               | 0xdf                | 223

### Notation in diagrams

    one byte:
    +--------+
    |        |
    +--------+

    a variable number of bytes:
    +========+
    |        |
    +========+

    variable number of objects stored in MessagePack or SchemaPack format:
    +~~~~~~~~~~~~~~~~~+
    |                 |
    +~~~~~~~~~~~~~~~~~+

`X`, `Y`, `Z` and `A` are the symbols that will be replaced by an actual bit.

### keyshape format family

KeyShape format family stores a sequence of strings and a number (or an array of numbers) which represents the shape ids of the object in which this key appears:

    A KeyShape is a tuple of a key and, a single shape id or an array of shape ids.

    Shape id stored as a single number:

    +~~~~~~~~~~~~~~+~~~~~~~~~~~~~~~~~~+
    |  key (str)   |  shapeId (uint)  |
    +~~~~~~~~~~~~~~+~~~~~~~~~~~~~~~~~~+

        E.G: (with fixstr and fixuint)
            +--------+~~~~~~~~+--------+
            |101XXXXX|key name|0YYYYYYY|
            +--------+~~~~~~~~+--------+

            where
            * 101XXXXX is the first byte of fixstr in MessagePack format
            * XXXXX is a 5-bit unsigned integer which represents N
            * N is the length of the string
            * YYYYYYY is a 7-bit unsigned integer which represents the shape id

        E.G: (with str 8 and uint 8)
            +--------+--------+========+--------+--------+
            |  0xd9  |XXXXXXXX|key name|  0xcc  |YYYYYYYY|
            +--------+--------+========+--------+--------+

            where
            * 0xd9 is the first byte of str 8 in MessagePack format
            * XXXXXXXX is a 8-bit unsigned integer which represents N
            * N is the length of the string
            * YYYYYYYY is a 8-bit unsigned integer which represents the shape id


    or Shape ids stored as an array of uints:

    +~~~~~~~~+~~~~~~~~+
    |  str   |  array |
    +~~~~~~~~+~~~~~~~~+

        E.G: (with fixstr and fixarray)
            +--------+~~~~~~~~+--------+--------+
            |101XXXXX|key name|1001YYYY|shapesid|
            +--------+~~~~~~~~+--------+--------+

            where
            * 101XXXXX is the first byte of fixstr in MessagePack format
            * XXXXX is a 5-bit unsigned integer which represents N
            * N is the length of the string
            * YYYYY is a 4-bit unsigned integer which represents M
            * M is the length of the array of shape ids

        E.G: (with str 8 and uarray (unlimited array))
            +--------+--------+========+--------+~~~~~~~~~+--------+
            |  0xd9  |XXXXXXXX|key name|  0xdc  |N objects|  0xdf  |
            +--------+--------+========+--------+~~~~~~~~~+--------+

            where
            * 0xd9 is the first byte of str 8 in MessagePack format
            * XXXXXXXX is a 8-bit unsigned integer which represents N
            * N is the length of the string
            * 0xdc is the first byte of uarray in SchemaPack format
            * YYYYYYYY is a 8-bit unsigned integer which represents M
            * M is the length of the array of shape ids

### schema format family

Schema format family stores a sequence of KeyShapes

    schema stores an indefinite-length chunk list of KeyShapes:
    +--------+~~~~~~~~~~~~~+--------+
    | 0xdd   |  KeyShapes  |  0xdf  |
    +--------+~~~~~~~~~~~~~+--------+

    where
    * 0xdd is the first byte of schema in SchemaPack format
    * KeyShapes is a sequence of KeyShape values in SchemaPack format
    * 0xdf is the first byte of break in SchemaPack format

### shape map format family

Shape map format family stores a sequence of object values in MessagePack format.

    fixshapemap stores a map whose length is upto 15 elements:
    +--------+~~~~~~~~+~~~~~~~~+
    |1001XXXX|shapeid |  data  |
    +--------+~~~~~~~~+~~~~~~~~+

    where
    * 1001XXXX is the first byte of fixshapemap in SchemaPack format
    * XXXX is a 4-bit unsigned integer which represents N
    * N is the number of elements in the map

        E.G: (with fixshapemap and fixint)
            +--------+--------+~~~~~~~~+
            |1001XXXX|0YYYYYYY|  data  |
            +--------+--------+~~~~~~~~+

            where
            * 1001XXXX is the first byte of fixshapemap in SchemaPack format
            * XXXXX is a 4-bit unsigned integer which represents N
            * N is the number of elements in the map
            * YYYYYYY is a 7-bit unsigned integer which represents the shape id


    shapemap stores a map whose length is unlimited:
    +--------+~~~~~~~~+~~~~~~~~+--------+
    |  0xde  |shapeid |  data  |  0xdf  |
    +--------+~~~~~~~~+~~~~~~~~+--------+

    where
    * 0xde is the first byte of shapemap in SchemaPack format
    * shapeid is a uint which represents the shape id of the object
    * data is a sequence of values in MessagePack format
    * 0xdf is the first byte of break in SchemaPack format
