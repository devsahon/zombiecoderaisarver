from flask import Blueprint, render_template, send_file, jsonify
import os
import markdown2
from pathlib import Path

docs_bp = Blueprint('docs', __name__)

def get_doc_content(doc_path: str) -> str:
    """Read and convert markdown to HTML"""
    try:
        with open(doc_path, 'r', encoding='utf-8') as f:
            content = f.read()
            return markdown2.markdown(
                content,
                extras=['fenced-code-blocks', 'tables', 'header-ids']
            )
    except Exception as e:
        return f"<p class='text-danger'>Error loading documentation: {str(e)}</p>"

@docs_bp.route('/<path:doc_path>')
def view_doc(doc_path):
    """Render documentation page"""
    # Convert path to docs directory
    full_path = os.path.join('docs', doc_path.replace('/', os.sep))
    if not full_path.endswith('.md'):
        full_path += '.md'
        
    if not os.path.exists(full_path):
        return render_template(
            'documentation.html',
            content="<p class='text-danger'>Documentation not found</p>"
        )
        
    content = get_doc_content(full_path)
    return render_template('documentation.html', content=content)

@docs_bp.route('/download/<path:doc_path>')
def download_doc(doc_path):
    """Download documentation as markdown"""
    full_path = os.path.join('docs', doc_path.replace('/', os.sep))
    if not full_path.endswith('.md'):
        full_path += '.md'
        
    if not os.path.exists(full_path):
        return jsonify({'error': 'Documentation not found'}), 404
        
    return send_file(
        full_path,
        mimetype='text/markdown',
        as_attachment=True,
        download_name=os.path.basename(full_path)
    )

@docs_bp.route('/list')
def list_docs():
    """List all available documentation files"""
    docs_dir = Path('docs')
    if not docs_dir.exists():
        return jsonify({'docs': []})
        
    docs = []
    for path in docs_dir.rglob('*.md'):
        relative_path = str(path.relative_to(docs_dir)).replace('\\', '/')
        with open(path, 'r', encoding='utf-8') as f:
            first_line = f.readline().strip()
            title = first_line.lstrip('#').strip() if first_line.startswith('#') else relative_path
            
        docs.append({
            'path': relative_path,
            'title': title
        })
        
    return jsonify({'docs': docs}) 

@docs_bp.route('/home_bn')
def home_bn():
    """Render Bangla home/intro documentation page"""
    content = get_doc_content('docs/home_bn.md')
    return render_template('documentation.html', content=content) 