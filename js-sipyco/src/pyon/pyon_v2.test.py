# Prints the test object originally found at
# sipyco/test/test_pyon.py

from fractions import Fraction
from collections import OrderedDict

import numpy as np
from sipyco import pyon

print(pyon.encode({
    None: False,
    True: b"bytes",

    # FIXME: skip float("inf"), because it gets serialized into invalid JSON
    # same goes for float("-inf") and float("nan")
    # see: https://docs.python.org/3/library/json.html#infinite-and-nan-number-values
    #
    #float("inf"): float("-inf"),

    (1, 2): [(3, 4.2), (2, )],
    "slice": slice(3),
    Fraction(3, 4): np.linspace(5, 10, 1),
    "set": {"testing", "sets"},
    "a": np.int8(9), "b": np.int16(-98), "c": np.int32(42), "d": np.int64(-5),
    "e": np.uint8(8), "f": np.uint16(5), "g": np.uint32(4), "h": np.uint64(9),

    # FIXME: use Float16Array, as soon it is natively available
    # see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float16Array
    #
    #"x": np.float16(9.0),

    "y": np.float32(9.0), "z": np.float64(9.0),
    1j: 1-9j,
    "q": np.complex128(1j),
    "zerodim": np.array(0),
    "od": OrderedDict(zip(reversed(range(3)), "abc")),
    "unicode": "\u269B",
    "newline": "\n" """
""",
}, True))
