#!/bin/bash
# Run only on Arch

cd ~/.cache/ms-playwright/webkit-*/minibrowser-gtk/lib || exit 1
rm libgio-2.0.so.0
rm libgio-2.0.so.0.7200.4
rm libglib-2.0.so.0
rm libglib-2.0.so.0.7200.4
