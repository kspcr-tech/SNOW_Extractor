import React, { useState, useEffect, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClipboardCopy, Download, FileText, CheckCircle2, AlertCircle, Search, Plus, Trash2, Settings, Copy, Mail } from 'lucide-react';

type FieldType = 'text' | 'emailList';

interface FieldDef {
  id: string;
  name: string;
  type: FieldType;
  lineOffset: number;
}

const DEFAULT_FIELDS: FieldDef[] = [
  { id: 'f1', name: 'Email list', type: 'emailList', lineOffset: 1 },
  { id: 'f2', name: 'Team DL/Group email address', type: 'emailList', lineOffset: 2 },
  { id: 'f3', name: 'Technical Contact Email', type: 'emailList', lineOffset: 1 },
  { id: 'f4', name: 'Business Contact Email', type: 'emailList', lineOffset: 1 },
  { id: 'f5', name: 'Catalog Task', type: 'text', lineOffset: 1 },
  { id: 'f6', name: 'ServiceNow Queue', type: 'text', lineOffset: 4 },
  { id: 'f7', name: 'Gear ID', type: 'text', lineOffset: 1 },
  { id: 'f8', name: 'Common Name( Fully Qualified Domain Name)', type: 'text', lineOffset: 4 },
];

const OFFLINE_HTML_CONTENT = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>ServiceNow Extractor</title>
    <!-- Babel Standalone for static hosting -->
    <!-- Pinned to version 7.24.7 to prevent breaking changes in latest -->
    <script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"></script>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; color: #1f2937; padding: 2rem; margin: 0; }
        .container { max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: 1.5rem; }
        .header { width: 100%; background: white; padding: 1.5rem 2rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1rem; }
        h1 { font-size: 1.5rem; margin: 0 0 0.5rem 0; color: #111827; }
        p { color: #4b5563; margin: 0; }
        .col { flex: 1; min-width: 300px; background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        
        /* Config Styles */
        .config-row { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.375rem; margin-bottom: 0.5rem; }
        .config-info { display: flex; flex-direction: column; }
        .config-name { font-weight: 600; font-size: 0.875rem; }
        .config-type { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; }
        .btn-icon { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.875rem; font-weight: 600; }
        .btn-icon:hover { text-decoration: underline; }
        
        .add-field-form { display: flex; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; }
        .add-field-form input, .add-field-form select { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; }
        .add-field-form input { flex: 1; }
        
        /* Input Styles */
        textarea { width: 100%; height: 200px; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; margin-bottom: 1rem; font-family: monospace; box-sizing: border-box; resize: vertical; }
        button.primary { background-color: #4f46e5; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.375rem; cursor: pointer; font-size: 1rem; font-weight: 500; width: 100%; }
        button.primary:hover { background-color: #4338ca; }
        
        /* Results Styles */
        .result-item { margin-bottom: 1.5rem; }
        .result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .result-label { font-weight: 600; color: #4b5563; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .btn-copy { background-color: #f3f4f6; color: #4f46e5; border: 1px solid #e5e7eb; padding: 0.25rem 0.75rem; border-radius: 0.375rem; cursor: pointer; font-size: 0.75rem; font-weight: 600; }
        .btn-copy:hover { background-color: #e0e7ff; }
        .result-value { font-family: monospace; color: #111827; word-break: break-all; font-size: 1rem; background: #f9fafb; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 0.375rem; min-height: 1.5rem; }
        #email-body-val a { color: #2563eb; text-decoration: underline; cursor: pointer; }
        #email-body-val a:hover { color: #1d4ed8; }
        #email-body-val ul { padding-left: 1.5rem; margin: 0.5rem 0; list-style-type: disc; }
        #email-body-val ol { padding-left: 1.5rem; margin: 0.5rem 0; list-style-type: decimal; }
        #email-body-val strong, #email-body-val b { font-weight: bold; }
        #email-body-val em, #email-body-val i { font-style: italic; }
        
        .section-title { font-size: 1.125rem; font-weight: 600; margin-top: 0; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ServiceNow Extractor (Offline)</h1>
            <p>Dynamically extract fields from ServiceNow pages.</p>
        </div>
        
        <div class="col" style="flex: 1;">
            <h2 class="section-title">1. Configure Fields</h2>
            <div id="fields-list"></div>
            
            <div class="add-field-form">
                <input type="text" id="new-field-name" placeholder="Field Name (e.g. Manager)">
                <select id="new-field-type">
                    <option value="text">Text Value</option>
                    <option value="emailList">Email List</option>
                </select>
                <div style="display: flex; align-items: center; gap: 0.25rem; border: 1px solid #d1d5db; border-radius: 0.375rem; padding: 0 0.5rem; background: white;">
                    <span style="font-size: 0.75rem; color: #6b7280; white-space: nowrap;">Line +</span>
                    <input type="number" id="new-field-offset" value="1" min="0" max="20" style="width: 40px; border: none; padding: 0.5rem 0; outline: none;">
                </div>
                <button class="btn-copy" onclick="addField()" style="padding: 0.5rem 1rem;">Add</button>
            </div>
        </div>

        <div class="col" style="flex: 1.5;">
            <h2 class="section-title">2. Input Content</h2>
            <textarea id="input-text" placeholder="Paste ServiceNow page text or HTML source here..."></textarea>
            <button class="primary" onclick="extractData()">Extract Details</button>
        </div>

        <div class="col" style="flex: 1.5;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; margin-bottom: 1rem; padding-bottom: 0.5rem;">
                <h2 class="section-title" style="border: none; margin: 0; padding: 0;">3. Results</h2>
                <button id="copy-all-btn" class="btn-copy" onclick="copyAll()" style="display: none;">Copy All</button>
            </div>
            <div id="results-container">
                <p style="color: #9ca3af; text-align: center; padding: 2rem 0;">Results will appear here.</p>
            </div>
        </div>

        <div class="col" style="flex: 100%; margin-top: 1.5rem;">
            <h2 class="section-title">4. Email Output</h2>
            <div style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <label style="font-size: 0.875rem; font-weight: 600; color: #4b5563;">List of Email IDs</label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #4b5563; cursor: pointer;">
                        <input type="checkbox" id="invalid-team-dl-checkbox" onchange="updateEmailOutput()">
                        Mark if Team DL is invalid
                    </label>
                </div>
                <textarea id="email-output-input" placeholder="Paste email IDs here to check against Team DL..." style="height: 100px;" oninput="updateEmailOutput()"></textarea>
            </div>
            <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
                <div style="flex: 1; background: #f9fafb; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.375rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span class="result-label">To</span>
                        <button class="btn-copy" onclick="copyEmailTo(this)">Copy</button>
                    </div>
                    <div id="email-to-val" class="result-value" style="background: transparent; border: none; padding: 0;">Need confirmation</div>
                </div>
                <div style="flex: 1; background: #f9fafb; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.375rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span class="result-label">Cc</span>
                        <button class="btn-copy" onclick="copyEmailCc(this)">Copy</button>
                    </div>
                    <div id="email-cc-val" class="result-value" style="background: transparent; border: none; padding: 0;">Need confirmation</div>
                </div>
            </div>
            <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; flex-direction: column;">
                <div style="flex: 1; background: #f9fafb; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.375rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span class="result-label">Subject</span>
                        <button class="btn-copy" onclick="copyEmailSubject(this)">Copy</button>
                    </div>
                    <div id="email-subject-val" class="result-value" style="background: transparent; border: none; padding: 0;">Need confirmation</div>
                </div>
                <div style="flex: 1; background: #f9fafb; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.375rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span class="result-label">Email Body (Editable)</span>
                        <button class="btn-copy" onclick="copyEmailBody(this)">Copy</button>
                    </div>
                    <div id="email-body-val" class="result-value" style="background: transparent; border: none; padding: 0;">Need confirmation</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        var fields = [
            { id: 'f1', name: 'Email list', type: 'emailList', lineOffset: 1 },
            { id: 'f2', name: 'Team DL/Group email address', type: 'emailList', lineOffset: 2 },
            { id: 'f3', name: 'Technical Contact Email', type: 'emailList', lineOffset: 1 },
            { id: 'f4', name: 'Business Contact Email', type: 'emailList', lineOffset: 1 },
            { id: 'f5', name: 'Catalog Task', type: 'text', lineOffset: 1 },
            { id: 'f6', name: 'ServiceNow Queue', type: 'text', lineOffset: 4 },
            { id: 'f7', name: 'Gear ID', type: 'text', lineOffset: 1 },
            { id: 'f8', name: 'Common Name( Fully Qualified Domain Name)', type: 'text', lineOffset: 4 }
        ];
        var extractedResults = {};

        function generateId() {
            return 'id_' + Math.random().toString(36).substr(2, 9);
        }

        function renderFields() {
            var html = '';
            for(var i=0; i<fields.length; i++) {
                var f = fields[i];
                var typeLabel = f.type === 'text' ? 'Text Value' : 'Email List';
                html += '<div class="config-row">';
                html += '<div class="config-info"><span class="config-name">' + f.name + '</span><span class="config-type">' + typeLabel + ' (Line +' + f.lineOffset + ')</span></div>';
                html += '<button class="btn-icon" onclick="removeField(\\'' + f.id + '\\')">Remove</button>';
                html += '</div>';
            }
            document.getElementById('fields-list').innerHTML = html;
        }

        function addField() {
            var nameInput = document.getElementById('new-field-name');
            var typeInput = document.getElementById('new-field-type');
            var offsetInput = document.getElementById('new-field-offset');
            var name = nameInput.value.trim();
            if(!name) return;
            
            var offset = parseInt(offsetInput ? offsetInput.value : "1", 10) || 0;
            fields.push({ id: generateId(), name: name, type: typeInput.value, lineOffset: offset });
            nameInput.value = '';
            renderFields();
        }

        function removeField(id) {
            var newFields = [];
            for(var i=0; i<fields.length; i++) {
                if(fields[i].id !== id) newFields.push(fields[i]);
            }
            fields = newFields;
            renderFields();
        }

        // Extraction Logic
        function getEmailListAfter(text, keyword) {
            var idx = text.toLowerCase().indexOf(keyword.toLowerCase());
            if (idx === -1) return "";
            var chunk = text.substring(idx + keyword.length, idx + keyword.length + 1000);
            var splitChunk = chunk.split(/\\n\\s*\\n/)[0];
            var regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g;
            var matches = [];
            var match;
            
            while ((match = regex.exec(splitChunk)) !== null) {
                var email = match[0];
                var isDuplicate = false;
                for (var i = 0; i < matches.length; i++) {
                    if (matches[i].toLowerCase() === email.toLowerCase()) { 
                        isDuplicate = true; 
                        break; 
                    }
                }
                if (!isDuplicate) matches.push(email);
            }
            return matches.join(", ");
        }

        function getValueAfter(text, keyword) {
            var regex = new RegExp(keyword + "\\\\s*[:\\\\-]?\\\\s*([^\\\\n]+)", "i");
            var match = text.match(regex);
            if (match && match[1].trim()) {
                return match[1].trim();
            }
            var regexNextLine = new RegExp(keyword + "\\\\s*[:\\\\-]?\\\\s*[\\\\r\\\\n]+\\\\s*([^\\\\n]+)", "i");
            var matchNextLine = text.match(regexNextLine);
            if (matchNextLine && matchNextLine[1].trim()) {
                return matchNextLine[1].trim();
            }
            return "";
        }

        function extractData() {
            var text = document.getElementById('input-text').value;
            if (!text) { alert("Please paste some text first."); return; }

            var isHtml = /<[a-z][\\s\\S]*>/i.test(text);
            var lines = text.split(/\\r?\\n/);

            extractedResults = {};
            for(var i=0; i<fields.length; i++) {
                var f = fields[i];
                var val = "";
                
                if (!isHtml) {
                    var keywordIndex = -1;
                    for(var j=0; j<lines.length; j++) {
                        if(lines[j].toLowerCase().indexOf(f.name.toLowerCase()) !== -1) {
                            keywordIndex = j;
                            break;
                        }
                    }
                    
                    if (keywordIndex !== -1) {
                        var targetLineIndex = keywordIndex + f.lineOffset;
                        if (targetLineIndex < lines.length) {
                            var targetLine = lines[targetLineIndex].trim();
                            if (f.lineOffset === 0) {
                                var regex = new RegExp(f.name + "\\\\s*[:\\\\-]?\\\\s*(.*)", "i");
                                var match = targetLine.match(regex);
                                targetLine = match ? match[1].trim() : targetLine;
                            }
                            
                            if (f.type === 'emailList') {
                                var emails = targetLine.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g);
                                if (emails) {
                                    var unique = [];
                                    for(var k=0; k<emails.length; k++) {
                                        if(unique.indexOf(emails[k].toLowerCase()) === -1) {
                                            unique.push(emails[k].toLowerCase());
                                        }
                                    }
                                    // Map back to original casing
                                    var originalCased = [];
                                    for(var u=0; u<unique.length; u++) {
                                        for(var e=0; e<emails.length; e++) {
                                            if (emails[e].toLowerCase() === unique[u]) {
                                                originalCased.push(emails[e]);
                                                break;
                                            }
                                        }
                                    }
                                    val = originalCased.join(", ");
                                }
                            } else {
                                val = targetLine;
                            }
                        }
                    }
                } else {
                    if (f.type === 'text') {
                        val = getValueAfter(text, f.name);
                        // Fallbacks for specific default fields
                        if (!val && f.name === 'ServiceNow Queue') {
                            val = getValueAfter(text, 'Assignment Group') || getValueAfter(text, 'Queue');
                        }
                        if (!val && f.name === 'Gear ID') {
                            val = getValueAfter(text, 'Gear');
                        }
                    } else if (f.type === 'emailList') {
                        val = getEmailListAfter(text, f.name);
                    }
                }
                
                extractedResults[f.id] = val || "Not found";
            }

            renderResults();
            updateEmailOutput();
        }

        function formatEmailList(emailsStr) {
            var emails = emailsStr.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
            var uniqueEmails = [];
            for(var i=0; i<emails.length; i++) {
                if(uniqueEmails.indexOf(emails[i]) === -1) uniqueEmails.push(emails[i]);
            }
            if (uniqueEmails.length === 0) return "";
            if (uniqueEmails.length === 1) return uniqueEmails[0];
            if (uniqueEmails.length === 2) return uniqueEmails.join(" and ");
            var last = uniqueEmails.pop();
            return uniqueEmails.join(", ") + " and " + last;
        }

        function updateEmailOutput() {
            var isInvalid = document.getElementById('invalid-team-dl-checkbox').checked;
            var inputEl = document.getElementById('email-output-input');
            var bodyEl = document.getElementById('email-body-val');
            var toEl = document.getElementById('email-to-val');
            var ccEl = document.getElementById('email-cc-val');
            var subjectEl = document.getElementById('email-subject-val');
            
            if (isInvalid) {
                inputEl.disabled = true;
                inputEl.style.opacity = '0.5';
                inputEl.style.cursor = 'not-allowed';
                toEl.innerText = "not a valid Team DL";
                ccEl.innerText = "not a valid Team DL";
                subjectEl.innerText = "not a valid Team DL";
                bodyEl.innerHTML = "not a valid Team DL";
                bodyEl.contentEditable = "false";
                bodyEl.style.backgroundColor = "transparent";
                return;
            }
            
            inputEl.disabled = false;
            inputEl.style.opacity = '1';
            inputEl.style.cursor = 'text';

            var input = inputEl.value.toLowerCase();
            var teamDlField = fields.find(function(f) { return f.name === 'Team DL/Group email address'; });
            var techContactField = fields.find(function(f) { return f.name === 'Technical Contact Email'; });
            var catalogTaskField = fields.find(function(f) { return f.name === 'Catalog Task'; });
            var commonNameField = fields.find(function(f) { return f.name === 'Common Name( Fully Qualified Domain Name)'; });
            
            var extractedTeamDl = (teamDlField && extractedResults[teamDlField.id] && extractedResults[teamDlField.id] !== "Not found") ? extractedResults[teamDlField.id] : "";
            var techContact = (techContactField && extractedResults[techContactField.id] && extractedResults[techContactField.id] !== "Not found") ? extractedResults[techContactField.id] : "";
            var catalogTask = (catalogTaskField && extractedResults[catalogTaskField.id] && extractedResults[catalogTaskField.id] !== "Not found") ? extractedResults[catalogTaskField.id] : "";
            var commonName = (commonNameField && extractedResults[commonNameField.id] && extractedResults[commonNameField.id] !== "Not found") ? extractedResults[commonNameField.id] : "";
            
            var hasTeamDl = extractedTeamDl && input.indexOf(extractedTeamDl.toLowerCase()) !== -1;
            
            toEl.innerText = techContact || "Need confirmation";
            
            var teamDlEmails = extractedTeamDl.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
            var inputEmails = inputEl.value.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
            
            var allCc = hasTeamDl ? teamDlEmails.slice() : teamDlEmails.concat(inputEmails);
            allCc.push("corebridge_pki@corebridgefinancial.com");
            
            var uniqueCc = [];
            for(var i=0; i<allCc.length; i++) {
                if(uniqueCc.indexOf(allCc[i]) === -1) uniqueCc.push(allCc[i]);
            }
            
            var ccString = uniqueCc.join("; ");
            ccEl.innerText = ccString ? ccString + ":" : "Need confirmation";
            
            var DEFAULT_EMAIL_BODY = '<p>Hi&nbsp;<br>Good Day!</p><p>Thank you for raising the request with us. <strong>Please find attached TLS certificates requested in the subjected tickets.</strong></p><p>You may have noticed that your certificate request was fulfilled by our Internal Certificate Authority (CA). Since your domain(s) is located 100% inside the Corebridge enclave, a Corebridge CA internal certificate is appropriate.</p><p><strong><u>Please note:</u></strong><br>BEFORE INSTALLING THIS CERTIFICATE, the first thing you should do is to <strong><u>check in your trusted Root and Intermediate stores that the Corebridge Root and Corebridge Issuing CA 1 certs are present</u></strong>. The Intermediate and Root certificates are part of the standard build of all Corebridge workstations, desktops, laptops, and servers. However, third-party systems will probably require "custom" installation of the Corebridge Internal Root and Intermediate.</p><p>Please use our <strong>NEW SERVICENOW CATALOG</strong> going forward, using this link: <a href="https://test.crbg.com">SSL TLS PKI CERTIFICATE REQUEST | ServiceNow</a>. If the link doesn\\'t work, navigate to <a href="https://corebridge.service-now.com/sp">https://corebridge.service-now.com/sp</a>&nbsp;and search for "SSL TLS PKI CERTIFICATE REQUEST" in the service catalog.</p><p>For additional details related to SSL/TLS Certificates, review the PKI Confluence: <a href="https://rest.crbg.com">Corebridge PKI-SSL/TLS Certificates - Confluence</a></p><p>Thank you.<br>Regards,</p>';
            
            var formattedInputEmails = formatEmailList(inputEl.value);
            var NOT_MATCHING_BODY = '<p>Hello&nbsp;<br>Good Day!</p><p>Thank you for raising the request with us. I am from PKI team.</p><p>Upon checking the existing certificate- <strong>' + commonName + '</strong> for the subjected request, we can see that this certificate belongs to ' + formattedInputEmails + '</p><p>The email contacts mentioned in this renewal request is not matching with existing ownership. Please confirm regarding the updated ownership of the mentioned domein so that we can proceed with the renewal request. Additionally, I have added the existing certificate owners to this email for confirmation.</p><p>Thank you.<br>Regards,</p>';

            if (hasTeamDl) {
                subjectEl.innerText = catalogTask + " | Delivery of SSL certificate for CN " + commonName;
                bodyEl.innerHTML = DEFAULT_EMAIL_BODY;
                bodyEl.contentEditable = "true";
                bodyEl.style.backgroundColor = "#ffffff";
            } else {
                subjectEl.innerText = catalogTask + " | Confirmation Required for Ownership of CN " + commonName;
                bodyEl.innerHTML = NOT_MATCHING_BODY;
                bodyEl.contentEditable = "true";
                bodyEl.style.backgroundColor = "#ffffff";
            }
        }

        function copyEmailTo(btn) {
            doCopy(document.getElementById('email-to-val').innerText, btn);
        }

        function copyEmailCc(btn) {
            doCopy(document.getElementById('email-cc-val').innerText, btn);
        }

        function copyEmailSubject(btn) {
            doCopy(document.getElementById('email-subject-val').innerText, btn);
        }

        function copyEmailBody(btn) {
            var el = document.getElementById('email-body-val');
            var html = el.innerHTML;
            var plainText = el.innerText;
            
            if (navigator.clipboard && window.ClipboardItem) {
                var item = new ClipboardItem({
                    'text/html': new Blob([html], { type: 'text/html' }),
                    'text/plain': new Blob([plainText], { type: 'text/plain' })
                });
                navigator.clipboard.write([item]).then(function() {
                    var oldText = btn.innerText;
                    btn.innerText = "Copied!";
                    setTimeout(function() { btn.innerText = oldText; }, 2000);
                });
            } else {
                var selection = window.getSelection();
                var range = document.createRange();
                range.selectNodeContents(el);
                selection.removeAllRanges();
                selection.addRange(range);
                try {
                    document.execCommand("copy");
                    var oldText = btn.innerText;
                    btn.innerText = "Copied!";
                    setTimeout(function() { btn.innerText = oldText; }, 2000);
                } catch (err) {
                    alert("Failed to copy.");
                }
                selection.removeAllRanges();
            }
        }

        function renderResults() {
            var html = '';
            for(var i=0; i<fields.length; i++) {
                var f = fields[i];
                var val = extractedResults[f.id] || "Not found";
                html += '<div class="result-item">';
                html += '<div class="result-header">';
                html += '<span class="result-label">' + f.name + '</span>';
                html += '<button class="btn-copy" onclick="copySingle(\\'' + f.id + '\\', this)">Copy</button>';
                html += '</div>';
                html += '<div class="result-value" id="res_' + f.id + '">' + val + '</div>';
                html += '</div>';
            }
            document.getElementById('results-container').innerHTML = html;
            document.getElementById('copy-all-btn').style.display = 'inline-block';
        }

        function doCopy(text, btnElement) {
            if (window.clipboardData && window.clipboardData.setData) {
                window.clipboardData.setData("Text", text);
                if(btnElement) {
                    var oldText = btnElement.innerText;
                    btnElement.innerText = "Copied!";
                    setTimeout(function() { btnElement.innerText = oldText; }, 2000);
                }
            } else {
                var ta = document.createElement("textarea");
                ta.value = text;
                ta.style.position = "fixed";
                ta.style.opacity = "0";
                document.body.appendChild(ta);
                ta.select();
                try {
                    document.execCommand("copy");
                    if(btnElement) {
                        var oldText = btnElement.innerText;
                        btnElement.innerText = "Copied!";
                        setTimeout(function() { btnElement.innerText = oldText; }, 2000);
                    }
                } catch (err) {
                    alert("Failed to copy. Please copy manually.");
                }
                document.body.removeChild(ta);
            }
        }

        function copySingle(id, btnElement) {
            var text = extractedResults[id] || "";
            doCopy(text, btnElement);
        }

        function copyAll() {
            var finalString = "";
            for(var i=0; i<fields.length; i++) {
                var f = fields[i];
                var val = extractedResults[f.id] || "Not found";
                finalString += f.name + ": " + val + "\\r\\n";
            }
            doCopy(finalString, document.getElementById('copy-all-btn'));
        }

        // Init
        window.onload = function() {
            renderFields();
        };
    </script>
</body>
</html>`;

const DEFAULT_EMAIL_BODY = `<p>Hi&nbsp;<br>
Good Day!</p>
<p>Thank you for raising the request with us. <strong>Please find attached TLS certificates requested in the subjected tickets.</strong></p>
<p>You may have noticed that your certificate request was fulfilled by our Internal Certificate Authority (CA). Since your domain(s) is located 100% inside the Corebridge enclave, a Corebridge CA internal certificate is appropriate.</p>
<p><strong><u>Please note:</u></strong><br>
BEFORE INSTALLING THIS CERTIFICATE, the first thing you should do is to <strong><u>check in your trusted Root and Intermediate stores that the Corebridge Root and Corebridge Issuing CA 1 certs are present</u></strong>. The Intermediate and Root certificates are part of the standard build of all Corebridge workstations, desktops, laptops, and servers. However, third-party systems will probably require "custom" installation of the Corebridge Internal Root and Intermediate.</p>
<p>Please use our <strong>NEW SERVICENOW CATALOG</strong> going forward, using this link: <a href="https://test.crbg.com">SSL TLS PKI CERTIFICATE REQUEST | ServiceNow</a>. If the link doesn't work, navigate to <a href="https://corebridge.service-now.com/sp">https://corebridge.service-now.com/sp</a>&nbsp;and search for "SSL TLS PKI CERTIFICATE REQUEST" in the service catalog.</p>
<p>For additional details related to SSL/TLS Certificates, review the PKI Confluence: <a href="https://rest.crbg.com">Corebridge PKI-SSL/TLS Certificates - Confluence</a></p>
<p>Thank you.<br>
Regards,</p>`;

export default function App() {
  const [fields, setFields] = useState<FieldDef[]>(DEFAULT_FIELDS);
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<Record<string, string> | null>(null);
  
  // Copy states
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({});

  // New field form state
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');
  const [newFieldLineOffset, setNewFieldLineOffset] = useState<number>(1);

  // Email output state
  const [emailInput, setEmailInput] = useState('');
  const [isTeamDlInvalid, setIsTeamDlInvalid] = useState(false);
  const [emailTo, setEmailTo] = useState('Need confirmation');
  const [emailCc, setEmailCc] = useState('Need confirmation');
  const [emailSubject, setEmailSubject] = useState('Need confirmation');
  const [customEmailBody, setCustomEmailBody] = useState(DEFAULT_EMAIL_BODY);
  const [copiedTo, setCopiedTo] = useState(false);
  const [copiedCc, setCopiedCc] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const formatEmailList = (emailsStr: string) => {
    const emails = emailsStr.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const uniqueEmails = Array.from(new Set(emails));
    if (uniqueEmails.length === 0) return "";
    if (uniqueEmails.length === 1) return uniqueEmails[0];
    if (uniqueEmails.length === 2) return uniqueEmails.join(" and ");
    const last = uniqueEmails.pop();
    return uniqueEmails.join(", ") + " and " + last;
  };

  const getNotMatchingBody = (commonName: string, emailInput: string) => {
    const formattedEmails = formatEmailList(emailInput);
    return `<p>Hello&nbsp;<br>Good Day!</p>
<p>Thank you for raising the request with us. I am from PKI team.</p>
<p>Upon checking the existing certificate- <strong>${commonName}</strong> for the subjected request, we can see that this certificate belongs to ${formattedEmails}</p>
<p>The email contacts mentioned in this renewal request is not matching with existing ownership. Please confirm regarding the updated ownership of the mentioned domein so that we can proceed with the renewal request. Additionally, I have added the existing certificate owners to this email for confirmation.</p>
<p>Thank you.<br>Regards,</p>`;
  };

  useEffect(() => {
    if (isTeamDlInvalid) {
      setEmailTo("not a valid Team DL");
      setEmailCc("not a valid Team DL");
      setEmailSubject("not a valid Team DL");
      return;
    }

    if (!results) {
      setEmailTo("Need confirmation");
      setEmailCc("Need confirmation");
      setEmailSubject("Need confirmation");
      return;
    }

    const teamDlField = fields.find(f => f.name === 'Team DL/Group email address');
    const techContactField = fields.find(f => f.name === 'Technical Contact Email');
    const catalogTaskField = fields.find(f => f.name === 'Catalog Task');
    const commonNameField = fields.find(f => f.name === 'Common Name( Fully Qualified Domain Name)');

    const extractedTeamDl = (teamDlField && results[teamDlField.id] && results[teamDlField.id] !== "Not found") ? results[teamDlField.id] : "";
    const techContact = (techContactField && results[techContactField.id] && results[techContactField.id] !== "Not found") ? results[techContactField.id] : "";
    const catalogTask = (catalogTaskField && results[catalogTaskField.id] && results[catalogTaskField.id] !== "Not found") ? results[catalogTaskField.id] : "";
    const commonName = (commonNameField && results[commonNameField.id] && results[commonNameField.id] !== "Not found") ? results[commonNameField.id] : "";

    const hasTeamDl = extractedTeamDl && emailInput.toLowerCase().includes(extractedTeamDl.toLowerCase());

    setEmailTo(techContact || "Need confirmation");
    
    const teamDlEmails = extractedTeamDl.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const inputEmails = emailInput.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    
    let ccEmailsArray = hasTeamDl ? [...teamDlEmails] : [...teamDlEmails, ...inputEmails];
    ccEmailsArray.push("corebridge_pki@corebridgefinancial.com");
    
    const ccEmails = Array.from(new Set(ccEmailsArray));
    const ccString = ccEmails.join("; ");
    setEmailCc(ccString ? ccString + ":" : "Need confirmation");

    if (hasTeamDl) {
      setEmailSubject(`${catalogTask} | Delivery of SSL certificate for CN ${commonName}`);
      setCustomEmailBody(DEFAULT_EMAIL_BODY);
    } else {
      setEmailSubject(`${catalogTask} | Confirmation Required for Ownership of CN ${commonName}`);
      setCustomEmailBody(getNotMatchingBody(commonName, emailInput));
    }
  }, [emailInput, results, fields, isTeamDlInvalid]);

  let displayedEmailBody = customEmailBody;
  if (isTeamDlInvalid) {
    displayedEmailBody = "not a valid Team DL";
  } else if (!results) {
    displayedEmailBody = "Need confirmation";
  }

  const handleAddField = () => {
    if (!newFieldName.trim()) return;
    const newField: FieldDef = {
      id: `id_${Math.random().toString(36).substr(2, 9)}`,
      name: newFieldName.trim(),
      type: newFieldType,
      lineOffset: newFieldLineOffset
    };
    setFields([...fields, newField]);
    setNewFieldName('');
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    if (results) {
      const newResults = { ...results };
      delete newResults[id];
      setResults(newResults);
    }
  };

  const handleExtract = () => {
    if (!inputText.trim()) return;

    const isHtml = /<[a-z][\s\S]*>/i.test(inputText);
    const lines = inputText.split(/\r?\n/);

    const getEmailListAfter = (keyword: string) => {
      const idx = inputText.toLowerCase().indexOf(keyword.toLowerCase());
      if (idx === -1) return "";
      const chunk = inputText.substring(idx + keyword.length, idx + keyword.length + 1000);
      const splitChunk = chunk.split(/\n\s*\n/)[0];
      const matches = splitChunk.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
      if (!matches) return "";
      
      const uniqueEmails = Array.from(new Set(matches.map(e => e.toLowerCase())));
      const originalCased = uniqueEmails.map(lower => matches.find(m => m.toLowerCase() === lower)!);
      
      return originalCased.join(", ");
    };

    const getValueAfter = (keyword: string) => {
      const regex = new RegExp(keyword + "\\s*[:\\-]?\\s*([^\\n]+)", "i");
      const match = inputText.match(regex);
      if (match && match[1].trim()) return match[1].trim();
      
      const regexNextLine = new RegExp(keyword + "\\s*[:\\-]?\\s*[\\r\\n]+\\s*([^\\n]+)", "i");
      const matchNextLine = inputText.match(regexNextLine);
      if (matchNextLine && matchNextLine[1].trim()) return matchNextLine[1].trim();
      
      return "";
    };

    const newResults: Record<string, string> = {};
    
    fields.forEach(field => {
      let val = "";
      
      if (!isHtml) {
        const keywordIndex = lines.findIndex(line => line.toLowerCase().includes(field.name.toLowerCase()));
        if (keywordIndex !== -1) {
          const targetLineIndex = keywordIndex + field.lineOffset;
          if (targetLineIndex < lines.length) {
            let targetLine = lines[targetLineIndex].trim();
            if (field.lineOffset === 0) {
              const regex = new RegExp(field.name + "\\s*[:\\-]?\\s*(.*)", "i");
              const match = targetLine.match(regex);
              targetLine = match ? match[1].trim() : targetLine;
            }
            
            if (field.type === 'emailList') {
              const emails = targetLine.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
              if (emails) {
                const uniqueEmails = Array.from(new Set(emails.map(e => e.toLowerCase())));
                const originalCased = uniqueEmails.map(lower => emails.find(m => m.toLowerCase() === lower)!);
                val = originalCased.join(", ");
              }
            } else {
              val = targetLine;
            }
          }
        }
      } else {
        // HTML fallback
        if (field.type === 'text') {
          val = getValueAfter(field.name);
          // Fallbacks for specific default fields to maintain previous behavior
          if (!val && field.name === 'ServiceNow Queue') {
            val = getValueAfter('Assignment Group') || getValueAfter('Queue');
          }
          if (!val && field.name === 'Gear ID') {
            val = getValueAfter('Gear');
          }
        } else if (field.type === 'emailList') {
          val = getEmailListAfter(field.name);
        }
      }
      
      newResults[field.id] = val || "Not found";
    });

    setResults(newResults);
    setCopiedAll(false);
    setCopiedItems({});
  };

  const executeCopy = async (text: string, onSuccess: () => void) => {
    try {
      await navigator.clipboard.writeText(text);
      onSuccess();
    } catch (err) {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      onSuccess();
    }
  };

  const handleCopySingle = (id: string, text: string) => {
    executeCopy(text, () => {
      setCopiedItems(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedItems(prev => ({ ...prev, [id]: false }));
      }, 2000);
    });
  };

  const handleCopyAll = () => {
    if (!results) return;
    
    const textToCopy = fields.map(f => `${f.name}: ${results[f.id]}`).join('\n');

    executeCopy(textToCopy, () => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  const handleCopyTo = () => {
    executeCopy(emailTo, () => {
      setCopiedTo(true);
      setTimeout(() => setCopiedTo(false), 2000);
    });
  };

  const handleCopyCc = () => {
    executeCopy(emailCc, () => {
      setCopiedCc(true);
      setTimeout(() => setCopiedCc(false), 2000);
    });
  };

  const handleCopySubject = () => {
    executeCopy(emailSubject, () => {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    });
  };

  const handleCopyBody = async () => {
    const el = document.getElementById('email-body-content');
    if (!el) return;
    
    const html = el.innerHTML;
    const plainText = el.innerText;
    
    try {
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' })
      });
      await navigator.clipboard.write([clipboardItem]);
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    } catch (err) {
      // Fallback
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      selection?.removeAllRanges();
      selection?.addRange(range);
      document.execCommand('copy');
      selection?.removeAllRanges();
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    }
  };

  const handleDownloadOffline = () => {
    const blob = new Blob([OFFLINE_HTML_CONTENT], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'servicenow-extractor.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-6 h-6 text-indigo-600" />
              ServiceNow Extractor
            </h1>
            <p className="text-slate-500 mt-1">
              Dynamically extract fields from ServiceNow pages. No API keys required.
            </p>
          </div>
          <button 
            onClick={handleDownloadOffline}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Download Offline IE HTML
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Config */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
              <Settings className="w-5 h-5 text-slate-400" />
              <h2 className="font-semibold text-slate-800">1. Configure Fields</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-4">
              {fields.map(field => (
                <div key={field.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl group">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-slate-800">{field.name}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">
                      {field.type === 'text' ? 'Text Value' : field.type === 'email' ? 'Single Email' : 'Email List'}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRemoveField(field.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {fields.length === 0 && (
                <div className="text-center p-4 text-sm text-slate-500 italic border border-dashed border-slate-200 rounded-xl">
                  No fields configured. Add one below.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-sm font-medium text-slate-700">Add New Field</h3>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="Field Name (e.g. Manager)"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddField()}
                />
                <div className="flex gap-2">
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                    className="flex-1 p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value="text">Text Value</option>
                    <option value="emailList">Email List</option>
                  </select>
                  <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2">
                    <span className="text-xs text-slate-500 whitespace-nowrap">Line +</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={newFieldLineOffset}
                      onChange={(e) => setNewFieldLineOffset(parseInt(e.target.value) || 0)}
                      className="w-12 p-1 text-sm outline-none bg-transparent"
                    />
                  </div>
                  <button
                    onClick={handleAddField}
                    disabled={!newFieldName.trim()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column: Input */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
              <FileText className="w-5 h-5 text-slate-400" />
              <h2 className="font-semibold text-slate-800">2. Input Content</h2>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex gap-3 text-sm text-amber-800">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
              <p>
                Open the ServiceNow page, press <strong>Ctrl+A</strong> then <strong>Ctrl+C</strong> to copy the text, and paste it below.
              </p>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste ServiceNow page text or HTML source here..."
              className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none font-mono text-sm min-h-[250px]"
            />

            <button
              onClick={handleExtract}
              disabled={!inputText.trim() || fields.length === 0}
              className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2 shadow-sm"
            >
              <Search className="w-5 h-5" />
              Extract Details
            </button>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">3. Results</h2>
              {results && (
                <button
                  onClick={handleCopyAll}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium ${
                    copiedAll 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  {copiedAll ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
                  {copiedAll ? 'Copied All!' : 'Copy All'}
                </button>
              )}
            </div>

            {!results ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl p-8 text-center">
                <Search className="w-12 h-12 mb-3 text-slate-200" />
                <p className="text-sm">Configure fields, paste content, and click extract to see results here.</p>
              </div>
            ) : (
              <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                {fields.map(field => {
                  const val = results[field.id];
                  const isCopied = copiedItems[field.id];
                  return (
                    <div key={field.id} className="group">
                      <div className="flex justify-between items-end mb-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {field.name}
                        </label>
                        <button
                          onClick={() => handleCopySingle(field.id, val)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                            isCopied
                              ? 'text-emerald-600 bg-emerald-50'
                              : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 focus:opacity-100'
                          }`}
                        >
                          {isCopied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {isCopied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm text-slate-800 break-all">
                        {val}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Bottom Row: Email Output */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
            <Mail className="w-5 h-5 text-slate-400" />
            <h2 className="font-semibold text-slate-800">4. Email Output</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  List of Email IDs
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isTeamDlInvalid}
                    onChange={(e) => setIsTeamDlInvalid(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Mark if Team DL is invalid
                </label>
              </div>
              <textarea
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                disabled={isTeamDlInvalid}
                placeholder="Paste email IDs here to check against Team DL..."
                className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none font-mono text-sm min-h-[100px] ${isTeamDlInvalid ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">To</span>
                  <button
                    onClick={handleCopyTo}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      copiedTo
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 focus:opacity-100'
                    }`}
                  >
                    {copiedTo ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedTo ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="font-mono text-sm text-slate-800 break-all">{emailTo}</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cc</span>
                  <button
                    onClick={handleCopyCc}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      copiedCc
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 focus:opacity-100'
                    }`}
                  >
                    {copiedCc ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedCc ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="font-mono text-sm text-slate-800 break-all">{emailCc}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</span>
                  <button
                    onClick={handleCopySubject}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      copiedSubject
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 focus:opacity-100'
                    }`}
                  >
                    {copiedSubject ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedSubject ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="font-mono text-sm text-slate-800 break-all">{emailSubject}</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 group flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Body (Editable)</span>
                  <button
                    onClick={handleCopyBody}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      copiedBody
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 focus:opacity-100'
                    }`}
                  >
                    {copiedBody ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedBody ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div 
                  id="email-body-content"
                  className={`font-sans text-sm text-slate-800 outline-none flex-1 p-3 border border-slate-200 rounded-lg [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800 [&_a]:cursor-pointer [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 ${!isTeamDlInvalid ? 'bg-white focus:ring-2 focus:ring-indigo-500' : 'bg-transparent border-transparent px-0'}`}
                  contentEditable={!isTeamDlInvalid}
                  suppressContentEditableWarning
                  dangerouslySetInnerHTML={{ __html: displayedEmailBody }}
                  onBlur={(e) => {
                    if (!isTeamDlInvalid) {
                      setCustomEmailBody(e.currentTarget.innerHTML);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
